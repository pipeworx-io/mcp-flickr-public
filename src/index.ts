interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Flickr public feeds MCP — keyless slice of the Flickr API.
 *
 * Only the photos_public.gne feed (no API key required). For full search,
 * favorites, comments, etc. you need a real Flickr API key, which is out
 * of scope for this pack.
 */


const PUBLIC = 'https://api.flickr.com/services/feeds/photos_public.gne';
const USER_PHOTOS = 'https://api.flickr.com/services/feeds/photos_public.gne';
const GROUP_POOL = 'https://api.flickr.com/services/feeds/groups_pool.gne';
const UA = 'pipeworx-mcp-flickr-public/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'recent',
    description: 'Most recent public uploads, optionally tag-filtered.',
    inputSchema: {
      type: 'object',
      properties: {
        tags: { type: 'string', description: 'Comma-sep tags, e.g. "sunset,beach"' },
        tagmode: { type: 'string', description: 'all | any (default all)' },
        limit: { type: 'number', description: '1-20 (Flickr caps the feed at 20).' },
      },
    },
  },
  {
    name: 'by_user',
    description: 'Public uploads from one user.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'Flickr NSID (e.g. "12345678@N00") or screenname.' },
        limit: { type: 'number' },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'by_group',
    description: 'Public uploads in one group.',
    inputSchema: {
      type: 'object',
      properties: {
        group_id: { type: 'string', description: 'Flickr group id.' },
        limit: { type: 'number' },
      },
      required: ['group_id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'recent': {
      const params = baseParams();
      if (args.tags) params.set('tags', String(args.tags));
      if (args.tagmode) params.set('tagmode', String(args.tagmode));
      return slice(await flickrGet(`${PUBLIC}?${params}`), args.limit as number | undefined);
    }
    case 'by_user': {
      const params = baseParams();
      params.set('id', reqStr(args, 'user_id', '"flickr"'));
      return slice(await flickrGet(`${USER_PHOTOS}?${params}`), args.limit as number | undefined);
    }
    case 'by_group': {
      const params = baseParams();
      params.set('id', reqStr(args, 'group_id', '"<group-id>"'));
      return slice(await flickrGet(`${GROUP_POOL}?${params}`), args.limit as number | undefined);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function baseParams(): URLSearchParams {
  return new URLSearchParams({ format: 'json', nojsoncallback: '1' });
}

async function flickrGet(url: string): Promise<{ title?: string; items?: unknown[] }> {
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Flickr: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  // The feed wraps the response in single quotes around field names sometimes.
  // The format=json + nojsoncallback=1 combo is meant to fix this, but defensively:
  const text = await res.text();
  try {
    return JSON.parse(text) as { title?: string; items?: unknown[] };
  } catch {
    // Some feeds return single-quoted JSON. Best-effort repair.
    const fixed = text.replace(/'/g, '"');
    return JSON.parse(fixed) as { title?: string; items?: unknown[] };
  }
}

function slice(data: { items?: unknown[]; [k: string]: unknown }, limit?: number) {
  const items = data.items ?? [];
  const n = Math.min(20, Math.max(1, limit ?? 20));
  return { ...data, items: items.slice(0, n) };
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;

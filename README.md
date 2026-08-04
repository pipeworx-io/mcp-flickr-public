# @pipeworx/flickr-public

Flickr public photo feeds — keyless slice of the Flickr API. Only what the [feeds endpoint](https://www.flickr.com/services/feeds/) exposes: public recent photos, by tag, by user, by group.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

For everything else (full search, faves, comments) Flickr requires an API key — out of scope for this pack.

## Tools

- `recent(tags?, limit?)` — most recent public uploads, optionally tag-filtered
- `by_user(user_id, limit?)` — public uploads from one user
- `by_group(group_id, limit?)` — public uploads in one group

## Data source

`https://api.flickr.com/services/feeds/photos_public.gne?format=json&nojsoncallback=1`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "flickr-public": {
      "url": "https://gateway.pipeworx.io/flickr-public/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Flickr Public data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

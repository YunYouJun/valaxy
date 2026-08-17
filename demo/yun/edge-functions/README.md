# Moments like on EdgeOne

The moments page talks only to the HTTP endpoint configured in
`pages/moments/index.md`. Storage is a deployment concern and is not exposed to
the browser.

For EdgeOne Makers:

1. Create or choose a KV namespace.
2. Bind that namespace to the deployed project with the variable name
   `moments_like`.
3. Make sure this `edge-functions` directory is under the project's configured
   root directory.
4. Deploy the project. The file at `api/moments-like.js` becomes
   `/api/moments-like`.

The namespace can have any name and does not need pre-created moment records.
The function hashes each moment route path to a KV-compatible SHA-256 key and
creates the record on the first like.

EdgeOne KV does not expose an atomic increment/decrement operation. Concurrent
updates may overwrite each other, so this example is an eventually consistent
lightweight counter rather than a transactionally exact counter.

Other hosting providers can implement the same endpoint contract with their own
serverless function and storage. Sites without a server-side storage option
should leave `moments.likes.enabled` disabled.

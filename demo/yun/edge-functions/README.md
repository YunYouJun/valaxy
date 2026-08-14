# Moment likes on EdgeOne

The moments page talks only to the HTTP endpoint configured in
`pages/moments/index.md`. Storage is a deployment concern and is not exposed to
the browser.

For EdgeOne Makers:

1. Create or choose a KV namespace.
2. Bind that namespace to the deployed project with the variable name
   `moment_likes`.
3. Make sure this `edge-functions` directory is under the project's configured
   root directory.
4. Deploy the project. The file at `api/moment-likes.js` becomes
   `/api/moment-likes`.

The namespace can have any name and does not need pre-created moment records.
The function hashes each moment route path to a KV-compatible SHA-256 key and
creates the record on the first like.

Other hosting providers can implement the same endpoint contract with their own
serverless function and storage. Sites without a server-side storage option
should leave `moments.likes.enabled` disabled.

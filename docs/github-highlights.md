# GitHub Highlights

Workflow: `.github/workflows/snake.yml`. Generated cards and snake files are published to the `output` branch so automated updates never create commits or push conflicts on `main`.

## Update behavior

- Runs after changes to README, scripts, or the workflow on `main`; also supports manual dispatch.
- Scheduled at minute 17 and 47 of every hour (every 30 minutes). GitHub may delay scheduled jobs.
- Reads the public GitHub REST API; paginates all owned repositories. Stars and forks exclude forked repositories. These metrics do not count commits or contributions.
- Fetches contribution calendars from account creation through today, one year per GraphQL request using `GITHUB_TOKEN`. Local runs without a token read the public GitHub contribution calendar HTML and reject missing or unrecognized data. All requests must succeed before assets are written.
- Total contributions sums daily counts across all fetched years. Streaks count consecutive nonzero days, including across year boundaries. The current streak includes yesterday when today is still empty, and resets after a full missed day. Dates use UTC; the synchronization timestamp is displayed in WIB. Private contributions depend on calendar visibility/token access and may be absent.
- Writes desktop/mobile SVG cards and a JSON snapshot with a timestamp to the workflow's `dist` directory. Zeroes are real API values, not placeholders. A failed API request stops publication.
- Generates the contribution snake separately using `Platane/snk`, then links the generated files in README. Before the first successful run, README shows an explicit pending message rather than broken images.
- Publishes generated assets to the `output` branch with the repository's built-in `GITHUB_TOKEN`; no personal access token is required. Both generation steps must succeed before publishing. `main` is never modified by the workflow.
- GitHub image caching may delay display even after the `output` branch has updated. Profile READMEs cannot fetch API data with JavaScript when opened; the linked GitHub activity page is the live source.

## Activation and diagnosis

Push these files to the default branch (`main`). Open **Actions → Update GitHub Highlights → Run workflow** if an immediate refresh is needed. Check the run logs and the timestamp in `assets/github-highlights.json`.

If publishing assets is rejected, check Actions write permissions and whether the `output` branch is protected. Scheduled workflows in inactive public repositories can be disabled by GitHub; re-enable the workflow if needed. A workflow cannot update the published profile while its changes exist only locally.

## Local verification

Requires Node.js 22 or later. Run `node scripts/update-highlights.mjs` to fetch public metrics and `node --test scripts/update-highlights.test.mjs` to verify aggregation and timestamp rendering. Run `node scripts/render-snapshot.mjs` to rebuild the checked-in SVG examples from the last JSON snapshot without making API calls. Optional `GITHUB_TOKEN` increases API limits; never commit it.

README uses native headings, wrapping text, and `picture` sources for mobile images. GitHub sanitizes custom page styles, so service cards use a single column rather than a CSS grid. The snake is a full-year overview; the contribution calendar link provides readable daily detail on small screens.

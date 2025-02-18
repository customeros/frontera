# Frontera

A React + TypeScript application with middleware support.

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)][frontera-repo]
[![license](https://img.shields.io/badge/license-Apache%202-blue)][apache2]
[![stars](https://img.shields.io/github/stars/customeros/frontera?style=social)][frontera-repo]
[![twitter](https://img.shields.io/twitter/follow/openlineAI?style=social)][twitter]
[![slack](https://img.shields.io/badge/slack-community-blueviolet.svg?logo=slack)][slack]

## Prerequisites

- Node.js (v20)
- npm package manager
- Git

## Installation

1. Clone the repository:

```bash
git clone git@github.com:customeros/frontera.git
cd frontera
```

2. Install root dependencies:

```bash
npm install
```

3. Install middleware dependencies:

```bash
cd middleware
npm install
```

4. Set up environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file and fill in the required environment variables:

- `CUSTOMER_OS_API_KEY`: Your Customer OS API key
- `INTERNAL_API_PATH`: Internal API endpoint
- `INTERNAL_API_KEY`: Internal API authentication key
- `VITE_MIDDLEWARE_API_URL`: URL for the middleware API
- `VITE_CLIENT_APP_URL`: Client application URL
- And other required variables as listed in `.env.example`

## Running the Application

### Development Mode

To run both the frontend and middleware simultaneously:

```bash
npm run dev
```

This command uses `concurrently` to run:

- Vite development server (frontend)
- Middleware server

### Running Components Separately

To run the frontend only:

```bash
npm run vite
```

To run the middleware only:

```bash
npm run middleware
```

### Production Build

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development servers (frontend + middleware)
- `npm run build` - Create production build
- `npm run lint` - Run ESLint
- `npm run fix:lint` - Fix linting issues
- `npm run preview` - Preview production build
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:integration` - Run integration tests

## Code Generation

The project includes several code generation scripts:

- `npm run codegen:variants` - Generate Tailwind variants
- `npm run codegen:gql` - Generate GraphQL types

## Testing

- End-to-end tests: `npm run test:e2e`
- Integration tests: `npm run test:integration`

## Contributing

1. Ensure you have set up the pre-commit hooks (automatically done during `npm install`)
2. Make your changes
3. Run linting and tests before committing
4. Create a pull request

## Contributors

A massive thank you goes out to all these wonderful people ([emoji key][emoji]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mattbr0wn"><img src="https://avatars.githubusercontent.com/u/113338429?v=4?s=100" width="100px;" alt="Matt Brown"/><br /><sub><b>Matt Brown</b></sub></a><br /><a href="https://github.com/openline-ai/openline-customer-os/commits?author=mattbr0wn" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://openline.ai"><img src="https://avatars.githubusercontent.com/u/88987042?v=4?s=100" width="100px;" alt="Vasi Coscotin"/><br /><sub><b>Vasi Coscotin</b></sub></a><br /><a href="https://github.com/openline-ai/openline-customer-os/commits?author=xvasi" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/alexopenline"><img src="https://avatars.githubusercontent.com/u/95470380?v=4?s=100" width="100px;" alt="alexopenline"/><br /><sub><b>alexopenline</b></sub></a><br /><a href="https://github.com/openline-ai/openline-customer-os/commits?author=alexopenline" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/edifirut"><img src="https://avatars.githubusercontent.com/u/108661145?v=4?s=100" width="100px;" alt="edifirut"/><br /><sub><b>edifirut</b></sub></a><br /><a href="#infra-edifirut" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/openline-ai/openline-customer-os/pulls?q=is%3Apr+reviewed-by%3Aedifirut" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jontyk"><img src="https://avatars.githubusercontent.com/u/81759836?v=4?s=100" width="100px;" alt="Jonty Knox"/><br /><sub><b>Jonty Knox</b></sub></a><br /><a href="https://github.com/openline-ai/openline-customer-os/pulls?q=is%3Apr+reviewed-by%3Ajontyk" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tsearle"><img src="https://avatars.githubusercontent.com/u/4540323?v=4?s=100" width="100px;" alt="tsearle"/><br /><sub><b>tsearle</b></sub></a><br /><a href="https://github.com/openline-ai/openline-customer-os/commits?author=tsearle" title="Code">💻</a> <a href="https://github.com/openline-ai/openline-customer-os/commits?author=tsearle" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.openline.ai/"><img src="https://avatars.githubusercontent.com/u/135133139?v=4?s=100" width="100px;" alt="Alex Calinica"/><br /><sub><b>Alex Calinica</b></sub></a><br /><a href="https://github.com/openline-ai/openline-customer-os/pulls?q=is%3Apr+reviewed-by%3Aacalinica" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/openline-ai/openline-customer-os/commits?author=acalinica" title="Tests">⚠️</a> <a href="https://github.com/openline-ai/openline-customer-os/commits?author=acalinica" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/SilviuOpenline"><img src="https://avatars.githubusercontent.com/u/125381623?v=4?s=100" width="100px;" alt="SilviuOpenline"/><br /><sub><b>SilviuOpenline</b></sub></a><br /><a href="https://github.com/openline-ai/openline-customer-os/pulls?q=is%3Apr+reviewed-by%3ASilviuOpenline" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/openline-ai/openline-customer-os/commits?author=SilviuOpenline" title="Tests">⚠️</a> <a href="https://github.com/openline-ai/openline-customer-os/commits?author=SilviuOpenline" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

- This repo is licensed under [Apache 2.0][apache2], with the exception of the ee directory (if applicable).
- Copyright © Openline Technologies Inc. 2022 - 2025

<!--- References --->

[apache2]: https://www.apache.org/licenses/LICENSE-2.0
[frontera-repo]: https://github.com/customeros/frontera/
[emoji]: https://allcontributors.org/docs/en/emoji-key
[slack]: https://join.slack.com/t/openline-ai/shared_invite/zt-1i6umaw6c-aaap4VwvGHeoJ1zz~ngCKQ
[twitter]: https://twitter.com/OpenlineAI

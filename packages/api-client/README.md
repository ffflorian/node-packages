# api-client [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![npm version](https://img.shields.io/npm/v/@ffflorian/api-client.svg?style=flat)](https://www.npmjs.com/package/@ffflorian/api-client)

A simple API client using fetch ([Node.js](https://nodejs.org/api/globals.html#fetch) / [Web](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)).

## Prerequisites

- [Node.js](https://nodejs.org)
- npm (preinstalled) or [yarn](https://yarnpkg.com)

## Installation

ℹ️ This is a pure [ESM](https://nodejs.org/api/esm.html#introduction) module.

Run `yarn global add @ffflorian/api-client` or `npm i -g @ffflorian/api-client`.

## Usage

```ts
import {APIClient} from '@ffflorian/api-client';

const apiClient = new APIClient();
try {
  const data = await apiClient.get('https://example.com');
} catch (error) {
  console.error(error);
}
```

# DT

## usage

### transpile and launch
```
npm run reload
```
### run tests (Jest)
```
npm run test
```
### run linting (eslint)
```
npm run lint
```

## API

### `GET /`
Simple route to test the server is live, returns a `200`.

### `POST /movements/validation`
Send required payload (see `/test/movements/*.json` for examples).

Possible outcomes:
- HTTP 202 (valid)
- HTTP 400 (bad request)
- HTTP 500 (big server issue somehow)
- HTTP 418 (invalid)

Outcomes 202 and 418 may provide additional data in body, for instance this `[skipped]` element doesn't mean it's a `418` - it can simply be some out-of-place artifact that was... well, skipped.
```
[
    {
        "message": "[skipped] out of bound movement",
        "frame": [
            {
                "date": "2021-01-02T00:00:00.000Z",
                "balance": 10
            },
            null
        ],
        "movements": [
            {
                "id": 2,
                "date": "2100-01-01T01:01:01.000Z",
                "label": "credited by 10 cents",
                "amount": 10
            }
        ]
    }
]
```
A `418` status will be returned if there is at least one element containing a `message` starting with `[invalid]`. In case of such a status code, the messages will be wrapped in the array property `reasons`.

In all cases, all the data will be parsed, and all errors or warnings returned.

## architecture

- `.env`: environment variables, used by `dotenv`
- `jest.setup.ts`: pre-test file used by `jest`, loading `.env` parameters for tests
- `tsconfig.json`: main TS build file
- `tsconfig.lint.json`: parent to the above, inheriting `node14` preset, used by eslint
- `test`: test datasets to be used in `*.spec.ts` files (Jest unit tests)
- `src`: server sources (in TypeScript, `*.ts` files), which build into `dist`
  - `src/index.ts`: entry point, server bootstrap
  - `src/app.ts`: middleware declarations, routers aggregation
  - `src/routes`: Express routers
  - `src/services`: business singletons
  - `src/domain`: utilities - types, non-singleton business

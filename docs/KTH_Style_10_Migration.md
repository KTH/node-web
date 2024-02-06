# KTH Style 10 Migration

## POC – Places Web

### Prerequisites

- `@kth/kth-node-web-common` `>=8.2.0` or `9.1.0`.

### Notes

- Tested local environment with default environment variables, except `PLACES_API_URI=https://api-r.referens.sys.kth.se/api/places` and `PLACES_API_KEY`.
- Verified look of:
  - [412, Drottning Kristinas väg 48](http://localhost:3000/places/room/id/0b62fd86-3be8-4328-b637-10e7c4efe165)
  - [Sök lokal på KTH](http://localhost:3000/places)
  - [Admin sidan](http://localhost:3000/places/_admin)
- Used pull request [KTH Style 10 #107](https://github.com/KTH/node-web/pull/107) as a guide.
- Removed dependabot ignore for KTH Style.
- Updated `@kth/kth-node-web-common` and `@kth/style` to latest.
- Added routes for @kth/style assets.
- Included styles from @kth/style.
- Started application and got an error from the breadcrumb helper. Reverted `@kth/kth-node-web-common` to `8.2.0`. Also installed `kth-style@10`.
- Copied `kthFooter.handlebars` from `node-web`.
- Copied `kthHeader.handlebars` from `node-web`, and added breadcrumbs back in.
- Modified `publicLayout.handlebars` by adding:
  - `fonts.css`
  - JavaScript from `@kth/style`.
  - Removed `menu.js` from `kth-style`.
  - Added `script` element to initialize `MenuPanel`.
  - Removed `main` class from wrapping `div` element.
- Added theme property to the locals object sent to res[ponse].render in controllers.
- Styled all buttons by changing classes `btn` to `kth-button`, `btn-primary` to `primary`, and `btn-secondary` to `secondary`.
- Pushed branch and deployed to https://www-r.referens.sys.kth.se/places.
- Added `proxyPrefix` to remaining controllers with handlebars rendering.

# React 19 Migration

## Upgrade

### Sources

- [React 19 RC Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)

### Steps

- Install react and react-dom 19 RC
- Went through breaking changes, see [Breaking changes](#breaking-changes). Nothing impacted [node-web](https://github.com/KTH/node-web).

### Breaking Changes

- _Errors in render are not re-thrown_ will probably not affect our applications
- _Removed deprecated React APIs_
  - _Removed: propTypes and defaultProps for functions_ means that we should be ”migrating to TypeScript or another type-checking solution” in [program-find-web](https://github.com/KTH/program-find-web), [program-web](https://github.com/KTH/program-web), [course-find-web](https://github.com/KTH/course-find-web), [profiles-web](https://github.com/KTH/profiles-web), and [search-web](https://github.com/KTH/search-web).
  - _Removed: Legacy Context using contextTypes and getChildContext_ are not used in our applications
  - _Removed: string refs_ are not used in our applications
  - _Removed: Module pattern factories_ are (probably) not used in our applications
  - _Removed: React.createFactory_ is not used in our applications
  - _Removed: react-test-renderer/shallow_ seems to only be used in deprecated application [projects-web](https://github.com/KTH/projects-web)
- _Removed deprecated React DOM APIs_
  - _Removed: react-dom/test-utils_ is used in [profiles-web](https://github.com/KTH/profiles-web)
  - _Removed: ReactDOM.render_ is not used in our applications (it does show up in an example in [program-web](https://github.com/KTH/program-web))
  - _Removed: ReactDOM.hydrate_ is used in [program-web](https://github.com/KTH/program-web) and in deprecated application [projects-web](https://github.com/KTH/projects-web)
  - _Removed: unmountComponentAtNode_ is not used in our applications (it does show up in examples in [program-web](https://github.com/KTH/program-web) and [profiles-web](https://github.com/KTH/profiles-web))
  - _Removed: ReactDOM.findDOMNode_ is not used in our applications
- _New deprecations_
  - _Deprecated: element.ref_ might be used in our applications
  - _Deprecated: react-test-renderer_ is used in deprecated application [projects-web](https://github.com/KTH/projects-web) and kinda’ deprecated application [kth-style-web](https://github.com/KTH/kth-style-web)
- _Notable changes_
  - _StrictMode changes_. We only use _StrictMode_ in [job-find-web](https://github.com/KTH/job-find-web/). That could probably be improved.
  - _UMD builds removed_ won’t affect us
  - _Libraries depending on React internals may block upgrades_ is not applicable
- _TypeScript changes_ might affect [job-find-web](https://github.com/KTH/job-find-web/)

## Improve

### Sources

- [React 19 RC](https://react.dev/blog/2024/04/25/react-19)

### Steps

- Added `useTransition` to page `AdminStartPage`
- Replaced `useTransition` with `useActionState` in page `AdminStartPage`
- Noticed the new diffs fir hydration errors

## Notes

- We should try [codemods](https://codemod.com/)
- Klaro uses APIs that are deprecated in React 19

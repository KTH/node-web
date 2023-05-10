#!/bin/bash

ENV=$1

function echoYellow() {
  MSG=$1
  printf "\033[1;33m$MSG\033[0m\n"
}

echo
echoYellow "|--------------------------------------------------------|"
echoYellow "| Building the application with Bash and Webpack         |"
echoYellow "|--------------------------------------------------------|\n"

if [ "$ENV" == "prod" ]; then
  echo
  echoYellow "  1. Bundling the client app into the /dist folder\n"
  WEBPACK_ENV=prod WEBPACK_MODE=build webpack

  echo
  echoYellow "  Done.\n"
fi

if [ "$ENV" == "dev" ]; then
  echo
  echoYellow "  1. Bundling the client app into the /dist folder to list results\n"
  WEBPACK_ENV=dev WEBPACK_MODE=build webpack

  echo
  echoYellow "  2. Running watch on client app. Check /dist for changes\n"
  WEBPACK_ENV=dev WEBPACK_MODE=watch webpack
fi

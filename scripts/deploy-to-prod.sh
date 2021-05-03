#!/bin/bash

if [ -n "$CI" ]; then
  eval "$(ssh-agent -s)"
  ssh-add ~/.ssh/id_rsa
fi

FILES=("package.json" "package-lock.json" "index.js" "lib")
PACKAGE_NAME="ciabatta-timers-server-$TRAVIS_COMMIT.tgz"

tar -zcvf $PACKAGE_NAME "${FILES[@]}"
scp $PACKAGE_NAME $DEPLOY_USER@$DEPLOY_HOST:$TMP_LOCATION

ssh $DEPLOY_USER@$DEPLOY_HOST 'bash -s' < scripts/deploy.sh $TMP_LOCATION$PACKAGE_NAME $DEPLOY_PATH $PM2_APP_NAME

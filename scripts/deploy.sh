#!/bin/bash

if [ $# -ne 3 ]; then
  echo "You must provide exactly three arguments, you provided $#"
  exit 1
fi

echo "Copying $1 to $2"

tar -xf $1 -C $2
npm install --omit=dev --prefix $2
pm2 restart $3

#!/bin/bash

bin="../_bin/bin"

if [ "$1" != "" ]; then
  ${bin}/prep -d -b sg2003 $1
else
  rm *.json
  for i in `cat contents`; do
    ${bin}/prep -b sg2003 $i
  done
fi


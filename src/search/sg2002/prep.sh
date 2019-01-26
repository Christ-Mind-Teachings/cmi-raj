#!/bin/bash

bin="../_bin/bin"
rm *.json

if [ "$1" != "" ]; then
  ${bin}/prep -b sg2002 $1
else
  for i in `cat contents`; do
    ${bin}/prep -b sg2002 $i
  done
fi



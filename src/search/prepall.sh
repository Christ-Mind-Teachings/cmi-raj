#!/bin/bash

for i in yaa grad sg*; do
  echo $i
  cd $i
  ./prep.sh
  cd ..
done


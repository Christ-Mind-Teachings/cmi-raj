#!/bin/bash

for i in `cat convert`; do
  dos2unix $i
done



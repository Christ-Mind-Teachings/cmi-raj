#!/bin/bash

for i in yaa grad shorts sg*; do
	echo $i
	cd $i
	./prep.sh
	cd ..
done

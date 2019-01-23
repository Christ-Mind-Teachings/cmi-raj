# Convert js timing files to json

# remove variable declaration
s/^var.*/{/

#correct base value
s/nwffacim\//sg/

#remove trailing ";"
s/^;$//
s/^};$/}/

#branch to end of file if keys already have quotes
/"base":/ b
s/base/"base"/

/"title":/ b
s/title/"title"/

/"id":/ b
s/id/"id"/

/"seconds":/ b
s/seconds/"seconds"/

/"time":/ b
s/time/"time"/


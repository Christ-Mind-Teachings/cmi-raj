for i in sg*; do
  echo $i
  for t in $i/*.js; do
    d=${t:0:6}
    f=${t:7:6}
    echo "sed -f convert.sed < $t > $d/$f.json"
    sed -f convert.sed < $t > $d/$f.json
  done
done


#
# if we find the regex then we keep the one line paragraph
# - indicated this by returning 0
#
# return 1 if we want to discard the paragraph
#
function discardParagraph(p) {
  IGNORECASE = 1
  if (match(p,/start here/)) {
    return 1
  }
  if (match(p,/start the/)) {
    return 1
  }
  if (match(p,/what\?/)) {
    return 1
  }
  if (match(p,/read/)) {
    return 1
  }
  if (match(p,/yes/)) {
    return 1
  }
  if (match(p,/okay/)) {
    return 1
  }
  if (match(p,/thank you/)) {
    return 1
  }
  if (match(p,/exactly/)) {
    return 1
  }
  if (match(p,/of course/)) {
    return 1
  }
  if (match(p,/oh/)) {
    return 1
  }
  if (match(p,/continue/)) {
    return 1
  }
  if (match(p,/I see/)) {
    return 1
  }
  if (match(p,/I say/)) {
    return 1
  }
  if (match(p,/I have/)) {
    return 1
  }
  if (match(p,/I can/)) {
    return 1
  }
  if (match(p,/good afternoon/)) {
    return 1
  }
  if (match(p,/good evening/)) {
    return 1
  }
  if (match(p,/welcome/)) {
    return 1
  }
  if (match(p,/makes sense/)) {
    return 1
  }
  if (match(p,/you say/)) {
    return 1
  }
  if (match(p,/want me/)) {
    return 1
  }
  if (match(p,/answer your/)) {
    return 1
  }
  if (match(p,/back up/)) {
    return 1
  }
  if (match(p,/a question/)) {
    return 1
  }
  if (match(p,/microphone/)) {
    return 1
  }
  if (match(p,/that is correct/)) {
    return 1
  }
  if (match(p,/that is absolutely correct/)) {
    return 1
  }
  if (match(p,/right/)) {
    return 1
  }
  if (match(p,/excuse me/)) {
    return 1
  }
  if (match(p,/can i/)) {
    return 1
  }
  if (match(p,/indeed/)) {
    return 1
  }
  if (match(p,/i mean/)) {
    return 1
  }
  if (match(p,/very true/)) {
    return 1
  }
  if (match(p,/hello/)) {
    return 1
  }
  if (match(p,/^now$/)) {
    return 1
  }
  if (match(p,/^so$/)) {
    return 1
  }
  if (match(p,/^again$/)) {
    return 1
  }
  if (match(p,/^you see$/)) {
    return 1
  }

  IGNORECASE = 0
  return 0
}

BEGIN {
  i = 0
  p = 0
  l = -1
  fm = 0
  inp = false
  needComma = "n"

  if (debug == 0) {
    printf "{\n  \"source\": \"%s\",\n  \"book\": \"%s\",\n  \"unit\": \"%s\",\n", source, book, unit
    printf "  \"paragraph\": [\n"
  }
}
/---/ {
  if (fm == 0) {
    fm = 1
  }
  else if (fm == 1) {
    fm = 2
  }
  next
}
$1 ~ /##/ {
  # questions
  next
}
/^<div/ || /^<\/div/ {
  # found in acim study group transcripts
  next
}
/^\[\^/ {
  # a footnote reference
  next
}
/^\r$/ || /^$/ || /^\s*$/ || /^>$/ || /^>\s*$/ {
  if (debug == 1) {
    for (line in lines) {
      text = sprintf("%s %s", text, lines[line])
    }
    printf "%s\n\n", tolower(text)
    l = -1
    text = ""
    delete lines
    p++
    next
  }

  if (l > -1) {
    len = length(lines)
    discard = 0
    if (len == 1) {
      discard = discardParagraph(lines[0])
    }
    printf "  %s{\n", needComma == "y" ? "," : ""
    printf "    \"discard\": %u,\n", discard
    printf "    \"pid\": %s,\n", p
    for (line in lines) {
      raw = lines[line]
      # some files contain 0x0d line terminators, remove them
      gsub(/\r/, "", raw)
      # remove html elements
      gsub(/\&hellip;/, "", raw)
      gsub(/\&ldquo;/, "", raw)
      gsub(/\&rdquo;/, "", raw)
      gsub(/\&lsquo;/, "", raw)
      gsub(/\&rsquo;/, "", raw)
      gsub(/\&ndash;/, " ", raw)
      gsub(/\&mdash;/, " ", raw)
      # remove <p></p> 
      gsub(/<\/?p[^>]*>/,"",raw)
      # remove <span></span> 
      gsub(/<\/?span[^>]*>/,"",raw)
      # remove punctuation
      gsub(/[\[\])(*>.,!?;:‘’'"“”/\\]/,"",raw)
      #remove 0xa0
      gsub(/ /,"",raw)
      #remove 0x09
      gsub(/	/," ",raw)
      #remove \%u2026 (elipsis)
      gsub(/…/," ",raw)
      # convert dash to space 
      gsub(/[-—]/," ",raw)
      # remove footnotes: [^1]
      gsub(/\^[[:digit:]]/, "", raw)
      text = sprintf("%s %s", text, raw)
    }
    # remove leading space
    gsub(/^ */, "", text)
    # collapse two spaces into one
    gsub(/  */," ",text)
    # remove underscores - text bracketed by __xxx__ are bolded by markdown
    gsub(/__/,"",text)
    printf "    \"text\": \"%s\"\n  }\n", tolower(text)
    l = -1
    text = ""
    delete lines
    needComma = "y"
    p++
  }
  next
}
{
  # only interested in lines after front matter (fm) removed
  # - that's when fm=2
  if (fm == 2) {
    l++
    lines[l] = $0
  }
}
END {
  if (debug == 0) {
    printf "]}\n"
  }
}


#!/bin/bash

emit() {
  local target='-target x86_64-unknown-linux-gnu'
  clang  -O0 -S -emit-llvm $target -o - "$1"
}
filter() {
  local scripts=()
  scripts+=(-e 's/;.*$//')
  scripts+=(-e '/^!/d')
  scripts+=(-e '/^attributes /d')
  scripts+=(-e 's/#[0-9]\+ //g')
  scripts+=(-e '/^[ ]*$/d')
  sed "${scripts[@]}"
}
emit "$@" | filter

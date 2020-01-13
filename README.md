# rEmote

This is an electron desktop app to dynamically display layered images, designed to be used in a live game streaming context.

## TODO

- persist new size and position
- refactor to follow a more mvc like pattern

### Control Window

- costume layer above emotion layer
- option to re-show display window if (accidentally) closed
- make gui look like wireframe
- make buttons thumbnails
- "None" option for emotion and costume layer

### Display Window

- should be resizeable, keep aspect ratio? or not to remove bleed?
- bounding box below edit buttons

## DONE

- click a button, png appears in display
- move display to other window (could start here)
- click one of many buttons, corresponding png appears in display
- have image sets, background, character, costume and emotions
- buttons are made for each file in directory
- image layering (bg, char base, clothes, emotion, back to front respectively)
- make a settings.json file that persists image directory locations
- set image directory
- persist directory locations
- no scroll bars in display window
- animated gifs
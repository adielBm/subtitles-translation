# subtitles-translation

### my problem
i wanted to watch movies in english in order to improve my english, but sometime there are words that i don't know, so i needed to check them on google translate everytime I encounter them during the movive.

### my solution
it process a subtitle file (.srt), Whenever it encounters a word not on my list of known words (`fam.txt`), it automatically adds a short translation next to the original word.

### prerequisites
- a file of list of known words (fam.txt)
- implement the function `translate(word)` that will translate a word from english to language that you know


### install

inside this folder run

```
npm install 
```

and then

```
npm install -g
```

### usage

the input file `en-subtitle.srt`

```srt
...

4
00:00:06,949 --> 00:00:08,309
going on some_unfamiliar_word now.

...
```

```
subtitles-translation add-translation en-subtitle.srt
```

then it outputs a file `translated-en-subtitle.srt`:

```srt
...

4
00:00:06,949 --> 00:00:08,309
going on some_unfamiliar_word <font size="10px" color="#d4d2d2"> (translation of some_unfamiliar_word)</font> now.

...
```
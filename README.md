# subtitles-translation

## The Problem
I wanted to watch movies in English to improve my language skills, but sometimes there are words I don't know. I had to check them on Google Translate every time I encountered them during the movie.

## My Solution
This tool processes a subtitle file (.srt). Whenever it encounters a word not on my list of known words (`fam.txt`), it automatically adds a short translation next to the original word.

## Prerequisites
- A file with a list of known words (fam.txt). To start, you can check lists of common words such as the Oxford 5000.
- Implement the function `translate(word)` to translate a word from English to your target language.
- You need to insert new words into your list as you learn them. You can use the command `subtitles-translation insert "newWord1, newWord2, newWord3, ..."`.
- You may need to make some changes to ensure it works properly.

## Installation

Inside this folder, run:

```shell
npm install
```

and then

```
npm install -g
```

#### Usage

the input file `en-subtitle.srt`

```srt
...

4
00:00:06,949 --> 00:00:08,309
going on some_unfamiliar_word now.

...
```
and run 
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

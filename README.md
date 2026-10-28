# STK IF DEMO WEBSITE

## DESCRIPTION
This is a demo website for Stockholm Tamil Kultur IF aka STK IF. STK IF is a Tamil cultural and sports club taking shape in Stockholm, bringing together culture, sport and community for every generation.

## AUTHORS

Team RAAT: 
Adam Aref, Anette Essel, Taiane Farias & Rubiya Jaffer @ Hyper Island

Thank you to STK IF for their feedback and contributions!

## PROJECT STATUS

This is the demo version of the website and doesn’t include any JavaScript features that are required for some features such as forms.

## USAGE

Each page has separate .html files that store the page content (text, images, etc.) and .css files which store the style (fonts, colors, etc.) of the page. For example, the about page content is stored in `about.html` while its style is stored in `about-styles.css` in the css folder. Site wide styles for elements such as the header and the footer are stored in `shared-styles.css`. 

If changing the html of the header and the footer, you must do so separately in each html file.

Both the html and css files have comments that indicate when code for specific sections start. Within html comments look like this. 
```
<!-- Header -->
```
While in css comments look like this.
```
/* Gallery page */
```

Images are stored in the “images” folder. If you are adding an image to a file that is within the project parent folder that stores the image folder (e.g. all the html files) you can link images by writing its path like below:
`"images/Venjanam-traditioanl-foods.jpg"`
However, if you are adding an image to a file that is within a subfolder of the parent folder (e.g. the css folder) you can link images by writing its path like below:
`"..images/Venjanam-traditioanl-foods.jpg"`

Fonts are in the fonts folder and are loaded in `css/shared-styles.css`. The site uses small compressed `.woff2` copies that keep only the letters it needs (English, Swedish and other Latin letters; Tamil); the `.ttf` files are the full originals they were made from. For example:
```
@font-face {
    font-family: 'Montserrat';
    src: url("../fonts/Montserrat-Variable-latin.woff2") format("woff2");
    font-weight: 100 900;
}
```

## SUPPORT
If you have any questions you can contact the authors by email. For each author the email is firstname.lastname@hyperisland.se


## MEMBERS PAGE

The Members page (`members.html`) shows a card for each club member with their photo, position and contact details. Each member has their own folder in `members/`, and `members/members-list.js` controls who is shown and in what order. See `members/README.md` for step-by-step instructions on adding or removing a member.

## ICONS

All icons are separate `.svg` files in the `icons/` folder. Add one to any button with `data-icon="name"`. See `icons/README.md`.

## LANGUAGES (ENGLISH · SVENSKA · தமிழ்)

The language switcher sits at the top of every page. Translations live in the `lang/` folder (`sv.js` for Swedish, `ta.js` for Tamil). See `lang/README.md` for how to edit or add translations.

## THEMES

All colours come from the theme files in `css/themes/`. Choose the theme in `css/theme.css` by changing one line:

- `golden-peak.css`: colours taken from the STK IF logo (gold, black, stone grey). **This is the default.**
- `sunrise.css`: soft dawn blush, coral and gold
- `nilgiri-mist.css`: misty green Nilgiri hills with golden sun
- `twilight.css`: dark evening sky, plum and lamp-gold

To preview a theme without changing any files, add `?theme=sunrise` (or `nilgiri-mist`, `twilight`) to the page address. `css/theme-base.css` applies the colours to every page; you normally don't need to edit it.

## MASCOT (NILGIRI TAHR)

Goat (Nilgiri tahr) pictures appear on every page. To change one:

1. Put your picture (transparent .png or .webp) in `mascots/my-goats/`.
2. In `mascots/mascot-list.js`, write its path next to the spot, e.g. `"home-hero": "mascots/my-goats/my-goat.png",`

Each spot can also take a list of pictures (one is picked at random) or `""` to hide it. Full guide, with every spot listed: `mascots/README.md`.

## LEARN TAMIL PAGE

`learn-tamil.html` has tabs for Tamil history, Tamil letters, Thirukkural (with pages) and Aathichoodi, plus a "Kural of the day". The content lives in the `learn/` folder, one file per tab, so you can add verses or whole new tabs (Moothurai, Nalvazhi, proverbs) without touching the page. See `learn/README.md`.

## UPDATING THE LIVE SITE (VERSION TAG)

Every stylesheet and script link ends with a version tag such as `?v=20261026-2`. Phones keep saved copies of these files, so after changing any `.css` or `.js` file, give the site a new tag before publishing:

```
node tools/bump-version.js 20261027-1
```

Use today's date and a running number. This makes every visitor's browser fetch the new files instead of mixing new pages with old styles.

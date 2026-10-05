# Replacing placeholders with real content

This project uses placeholders for logos and images and keeps all text in one resource file, so you can finish it without editing the code.

**Resource file:** `resources.js`
**Placeholder files:** `assets/images/`

## 1. Image and logo placeholders

| Resource key | Placeholder file | Where it appears | Recommended size | Format | Alt text |
|---|---|---|---|---|---|
| `images` | `assets/images/logo.jpg` | not referenced yet | 700 x 700 | JPG or WebP | Ultimate Transform Kundalini Yoga Foundation logo |
| `logo.hero` | `assets/images/logo.jpg` | `404.html`, `index.html` | 700 x 700 | JPG or WebP | Ultimate Transform Kundalini Yoga Foundation logo |
| `logo.footer` | `assets/images/logo.jpg` | `index.html` | 700 x 700 | JPG or WebP | Ultimate Transform Kundalini Yoga Foundation logo |
| `vision.image` | `assets/images/vision.jpg` | `index.html` | 800 x 1067 | JPG or WebP | Person meditating at sunrise with glowing chakras along the spine |
| `mission.image` | `assets/images/mission.jpg` | `index.html` | 800 x 1067 | JPG or WebP | Teacher seated in meditation among rocks |
| `gallery.0` | `assets/images/gallery-0-t.jpg` | `index.html` | 480 x 403 | JPG or WebP | Teacher guiding participants during a workshop |
| `gallery.1` | `assets/images/gallery-1-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher explaining a practice in a hall decorated with marigolds |
| `gallery.2` | `assets/images/gallery-2-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher seated in meditation among rocks |
| `gallery.3` | `assets/images/gallery-3-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Person meditating at sunrise with glowing chakras |
| `gallery.4` | `assets/images/gallery-4-t.jpg` | `index.html` | 480 x 720 | JPG or WebP | Woman meditating at sunrise with chakra lights |
| `gallery.5` | `assets/images/gallery-5-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher seated cross-legged in white with a striped stole |
| `gallery.6` | `assets/images/gallery-6-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Practitioner in a maroon kurta and orange stole in a meditation pose |
| `gallery.7` | `assets/images/gallery-7-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher seated cross-legged in an orange dhoti |
| `gallery.8` | `assets/images/gallery-8-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher in a meditation pose with hands on knees |
| `gallery.9` | `assets/images/gallery-9-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher seated in meditation in an orange dhoti |
| `gallery.10` | `assets/images/gallery-10-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher seated with hands resting on knees |
| `gallery.11` | `assets/images/gallery-11-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher with hands together in namaste |
| `gallery.12` | `assets/images/gallery-12-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher greeting with namaste |
| `gallery.13` | `assets/images/gallery-13-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher with hands in namaste and a striped stole |
| `gallery.14` | `assets/images/gallery-14-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Practitioner in a maroon kurta with hands in namaste |
| `gallery.15` | `assets/images/gallery-15-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher seated in an armchair |
| `gallery.16` | `assets/images/gallery-16-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher relaxing on a sofa |
| `gallery.17` | `assets/images/gallery-17-t.jpg` | `index.html` | 480 x 640 | JPG or WebP | Teacher seated in an armchair looking aside |
| `guide.image` | `assets/images/guide.jpg` | `index.html` | 800 x 1067 | JPG or WebP | Teacher speaking at a Kundalini workshop |

## 2. Replace an image or logo

1. Prepare your file at the recommended size and format from the table above.
2. Copy it into the placeholder folder.
3. Open resources.js and change the `src` for that key to your file (or give your file the placeholder's exact name and replace it).
4. Update the `alt` text for that key if needed.
5. Reload the page and check the image everywhere listed under "Where it appears".

## 3. Sample text to replace

The text below was written as realistic sample content so the layout looks right. Replace it with your real content (edit the value in the resource file).

| Key | Current sample | Where it appears |
|---|---|---|
| `sample.contact.address` | Your address, City | `index.html` |
| `sample.contact.email` | hello@example.com | `index.html` |
| `sample.contact.phone` | +00 000 000 0000 | `index.html` |
| `sample.guide.name` | Your Teacher | `index.html` |
| `sample.guide.text` | Add a short introduction here: background, training and how... | `index.html` |

## 4. Change any other text

All visible text is in resources.js. Find the key, edit the value, save. Do not edit text in the HTML or scripts.

## 5. Add a new language (optional)

Copy resources.js to a second file (for example `resources.fr.js`), translate the values under `strings`, and load that file instead.

## 6. Confirm nothing was missed

- Search the project for `placeholder`. No results means every placeholder has been replaced.
- Search for `sample`. No results in the resource file means all sample text has been replaced.
- Check the favicon and any social preview image, which are easy to forget.

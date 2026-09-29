# johanneshollenbach.com

Personal academic website, built with [Hugo](https://gohugo.io) using the
[hugo-website](https://github.com/pmichaillat/hugo-website) template
(based on the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme).

## Editing

- Home page text, menu, and social links: `config.yml`
- Papers: `data/papers.yml`
- Teaching: `data/teaching.yml`
- PDFs (CV, job market paper): `static/files/`
- Profile picture: `static/images/profile_picture.jpg`
- Custom styles: `assets/css/extended/custom.css`

## Local preview

```bash
hugo server
```

Then open http://localhost:1313.

## Deployment

Every push to `master` triggers `.github/workflows/hugo.yml`, which builds the
site and publishes it to GitHub Pages.

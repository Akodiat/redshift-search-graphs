
# Redshift search graphs
Efficient analysis of bandwidth coverage and spectral lines for finding z-specs.

Original code by Tom Bakx: https://github.com/tjlcbakx/redshift-search-graphs

User interface by Joakim Bohlin, Chalmers Infravis.

<img src="https://raw.githubusercontent.com/tjlcbakx/redshift-search-graphs/refs/heads/master/Fig_1_animated.gif" width="600px">

## Try it now
Simply go to https://akodiat.github.io/redshift-search-graphs to try the app yourself.

## Running locally
To run it locally, you need to start a static HTTP server in this directory. You can easily do that with the following Python command ([or any of these other options](https://gist.github.com/willurd/5720255))

```sh
python -m http.server 8000
```

Then, you can go to [localhost:8000](HTTP:/localhost:8000) (or whatever port you used above) to view the app.


### Pyodide
[Pyodide](https://pyodide.org/) is a Python distribution that can run in the browser (through WebAssembly), allowing you to call Python code from JavaScript.

# Lunar craters in three.js!

View GeoTIFF files as an interactive 3D mesh in WebGL. Currently, shows the lunar [Kepler crater](https://en.wikipedia.org/wiki/Kepler_(lunar_crater)).

### I want to give it a spin (pun intended), how do I do that?

However you like! ¯\\\_(ツ)\_/¯

I tend to run a python webserver with `python -m http.server` in the repo folder and it *just works*.

### Data references

- The GeoTIFF file was reprojected (no elliptical craters here) from the Lunar Orbiter Laser Altimeter (LOLA) data from NASA's Lunar Reconnaissance Orbiter spacecraft. The repo that spews those `.tiff` files is [here](https://github.com/vlas-sokolov/moon).
- Explanation and full list of data references for LOLA dataset: [link](https://astrogeology.usgs.gov/search/map/Moon/LRO/LOLA/Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014)
- Tables of lunar features taken from the [International Astronomical Union Planetary Gazetteer](https://planetarynames.wr.usgs.gov/).

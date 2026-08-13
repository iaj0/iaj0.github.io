# 3-D models

The portfolio page shows interactive 3-D viewers. Each viewer tries to load a
real `.stl` export; if the file is missing it falls back to a built-in
procedural preview, so the page always works.

## To show your real SolidWorks parts

Export each assembly from SolidWorks and drop the files here with these exact
names:

| Viewer                | File                               |
| --------------------- | ---------------------------------- |
| Input Shaft Assembly  | `assets/models/input-shaft.stl`    |

`input-shaft.stl` was built by merging the per-part STL exports of the
`Input_shaft_assay_4_Proj2` assembly (each part is exported in the assembly's
global coordinates, so concatenating them reassembles the gearbox).

The Project Murph viewer was removed (the full assembly STL wasn't available); the
Murph project now shows CAD renders instead.

### How to export an STL from SolidWorks
1. Open the assembly (`.SLDASM`).
2. **File → Save As**, set *Save as type* to **STL (*.stl)**.
3. Click **Options…** and choose **Fine** resolution (and, for an assembly,
   tick *Save all components of an assembly in a single file*).
4. Save with the file name above.

Keep the files reasonably small (a few MB) so the page loads quickly — the
**Fine** preset is usually plenty. To point a viewer at a different filename,
edit the `data-stl="…"` attribute on the matching `.model-viewport` in
`portfolio.html`.

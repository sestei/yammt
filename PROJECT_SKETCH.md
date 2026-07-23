# YAMMT - Yet another mode-matching tool

## Concept

YAMMT shall be a browser-based tool to help with modematching of Gaussian laser beams. The user shall be able to define a starting laser beam (given by wavelength, waist size, and waist location; defaults to 1064nm, 337µm and 0cm). Most of the window shall be filled with a plot of the laser beam across a reasonable distance (e.g., covering two Rayleigh ranges). From a settings panel, the user can choose the x-axis units to be in mm, cm, m or "holes"; the latter is the spacing of screw holes on an optical table, either 2.5cm or 1 inch. Using the scroll wheel, the user shall be able to move along the x axis. Using shift-scroll or dragging on the graph, the user shall be able to move along the x axis. The laser propagates towards the right of the screen. The y axis by default shows the beam diameter, autoscaling to a reasonable unit (mostly mm, perhaps µm). By default, the 1-sigma, 2-sigma and 3-sigma envelopes are shown (both positive and negative). The optical axis, i.e. y=0, shall always be in the center of the graph, i.e. moving the graph up or down is not possible. However, ctrl-mousewheel shall allow to zoom into the y axis. Optionally, on a secondary y axis, either the Gouy phase or the wavefront curvature shall be shown.

From a panel, the user can drag several components onto the main graph:
- a thin lens component
- a thick lens component
- a beam analyzer
- a placeholder

Once on the main graph, they shall be represented by stylized vector graphics as explained below. The user can then drag the components to a new location, which automatically updates the graph. If the component is not within the currently visible area of the graph, it is not displayed. Selecting a component shows its properties in a panel (which is at least the position on the x axis and a label that is shown next to the component). Components can be locked, which disables dragging them. Components can also be assigned to a group labelled 1-9 by pressing the respective number on the keyboard (or selecting it in the properties). Moving a component of a group moves all other components of the same group together. Assigning a group of 0 to a component removes it from all groups.

The thin lens component shall have a property window where one can set the lens diameter and its focal length in mm. It is represented in the graph as a stylized convex or concave lens, depending on the sign of the focal length. Stronger lenses shall be drawn with larger curvatures, but with a maximum curvature so that the drawing does not get too big.

The thick lens component shall have a property window where one can set the refractive index of the lens substrate, its left and right radius of curvature (in mm), its diameter (in mm), and its center thickness (in mm) can be set. If possible according to the zoom level of the x axis, the lens shall be drawn with correct radii of curvatures and dimensions. It should however cover a minimum extend if the zoom level becomes too small.

Both thin and thick lens shall modify the propagation of the Gaussian beam, according to their ABCD matrix definition, starting with the left-most lens to the right-most lens.

The beam analyzer shall be a component that shows the beam properties at the location of the analyzer, i.e. in the property window, it shows properties such as:
- the beam diameter
- the Gouy phase
- the wavefront curvature
- the complex q parameter
- the Rayleigh range
- the distance to the waist
The beam analyzer does not affect the beam itself.

The placeholder shall be a component that does not affect the beam, but rather marks a region of the plot as occupied by other components, such that lenses cannot be placed there. With the mouse or via the properties, one should be able to change the left and right boundary of the placeholder. The inner region of the placeholder shall be displayed with a transparent hatched fill.

### Further add-ons

- allow for astigmatic beams, i.e. with waist position and location defined for saggital and transversal directions; both axes should in this case be plotted on the screen, e.g. using different colours.
- allow for astigmatic lenses, with different radii of curvature for the two planes (thick lens); or different focal length for the two planes (thin lens)
- a database of predefined lenses, e.g. from the Thorlabs website
- a reader for Zemax-style lens definitions
- the possibility to define own databases
- a mode-matching assistant, which uses an optimization algorithm to find the optimal combination of two lenses out of the database to reach a user-defined waist size and location

### Implementation

The implementation should be as a client-only website, i.e. no server components such as node.js necessary. Users should be able to save their results as either a picture (preferably vector graphics), or a file that can be saved and later uploaded again to further work on the mode-matching solution.

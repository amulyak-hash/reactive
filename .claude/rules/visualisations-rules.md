# Visualisations Rules

All visualizations must strictly follow the guidelines outlined in this file.

## Mandatory Requirements

1. Visualizations must always be implemented using approved visualization libraries or packages.
2. Direct code-based or custom-built visualizations without using the designated libraries are not allowed.
3. If an existing custom visualization is being modified, it must be refactored to an approved library-based implementation instead of extending the custom renderer.
4. Visualization wrappers, labels, filters, legends, and drill-down controls may be application code, but the chart, graph, or diagram rendering itself must come from an approved library.

## Approved Libraries

- `d3`
- `d3-sankey`

## Scope

These rules apply to any chart, graph, flow diagram, sankey, trend line, pie, donut, or similar visual encoding of data.

## Enforcement Intent

- Do not introduce new inline SVG path construction for charts when an approved library can render the same visualization.
- Do not build custom bar, line, area, pie, donut, or sankey charts from raw DOM nodes, hand-authored SVG geometry, or ad hoc canvas drawing.
- Prefer adapting data into the approved library over re-creating rendering primitives by hand.

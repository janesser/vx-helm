import React, { useState } from 'react';

import MarkdownRenderer from 'react-markdown-renderer';
import Collapsible from 'react-collapsible';

import { Treemap, hierarchy, treemapSquarify } from '@vx/hierarchy';
import { Group } from '@vx/group';

class HelmChartHierarchy extends React.Component {

    constructor(props) {
        super(props);

        this.chartDetails = props.chartDetails
    }

    showDetails(content) {
        // TODO enhance with proper html box
        alert(JSON.stringify(content).replace(/\n/g, "<br>").replace(/[ ]/g, "&nbsp;"))
    }

    render() {
        if (!this.chartDetails)
            return (<div>nothing to display.</div>);

        const root = hierarchy({
            name: this.chartDetails.chartDescription.name + " " + this.chartDetails.chartDescription.appVersion,
            children: [
                {
                    name: '', // templates
                    // empty first template to display chart-name
                    children: [{ name: '', size: 400 }].concat(this.chartDetails.templates.map(t => {
                        const name = t.match(/(?<=name: )[^$\s]+/)
                        const kind = t.match(/(?<=kind: )[^$\s]+/)

                        return ({
                            name: typeof (name) == 'string' ? name.substring(0, 20) : name,
                            kind: kind,
                            type: 'template',
                            content: t,
                            size: 600
                        })
                    }))
                },
                {
                    name: '', // values
                    children: Object.entries(this.chartDetails.values).map(([k, v]) => ({
                        name: k.substring(0, 20),
                        type: 'value',
                        value: v != null ? v.toString() : '',
                        content: [k, v],
                        size: 400
                    }))
                }
            ]
        })
        const data = root.sum(d => d.size)

        const width = 800
        const height = 600

        const margin = { top: 30, left: 10, right: 10, bottom: 10 };
        const xMax = width - margin.left - margin.right;
        const yMax = height - margin.top - margin.bottom;

        return (<div>
            <Collapsible trigger="README (click to expand)">
                <MarkdownRenderer markdown={this.chartDetails.readme} />
            </Collapsible>
            <svg width={width} height={height} overflow-wrap="anywhere">
                <Treemap
                    root={data}
                    top={margin.top}
                    size={[xMax, yMax]}
                >
                    {
                        treemap =>
                            <Group>
                                {treemap.descendants().map((node, i) => {
                                    const nodeWidth = node.x1 - node.x0;
                                    const nodeHeight = node.y1 - node.y0;

                                    let nodeStroke = '#000000'

                                    switch (node.data.type) {
                                        case 'template':
                                            nodeStroke = '#AA0000'
                                            break
                                        case 'value':
                                            nodeStroke = '#00AA00'
                                            break
                                        default:
                                            if (node.depth > 2) {
                                                nodeStroke = '#0000AA'
                                                break
                                            }
                                    }

                                    return (
                                        <Group
                                            key={`node-${i}`}
                                            top={node.y0 + margin.top}
                                            left={node.x0 + margin.left}
                                            className={node.data.type}
                                            onClick={() => this.showDetails(node.data.content)}
                                        >
                                            <rect
                                                width={nodeWidth}
                                                height={nodeHeight}
                                                stroke={nodeStroke}
                                                strokeWidth={5 - node.depth}
                                                fill={node.depth == 0 ? '#FFFFFF' : "transparent"}
                                            />
                                            <text>
                                                <tspan x="5" dy="1.1em" fontSize="x-small">{node.data.name}</tspan>
                                                <tspan x="5" dy="1.1em" fontSize="xx-small" fontStyle="italic">{node.data.kind}</tspan>
                                            </text>
                                        </Group>
                                    )
                                })}
                            </Group>
                    }
                </Treemap>
            </svg>
        </div>)
    }
}

export default HelmChartHierarchy;
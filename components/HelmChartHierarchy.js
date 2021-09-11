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
        alert(content)
    }

    render() {
        if (!this.chartDetails)
            return (<div>nothing to display.</div>);

        const root = hierarchy({
            name: this.chartDetails.chartDescription.name + "@" + this.chartDetails.chartDescription.appVersion,
            children: [
                {
                    name: '', // templates
                    // empty first template to display chart-name
                    children: [{ name: '', size: 400 }].concat(this.chartDetails.templates.map(t => {
                        const name = t.match(/(?<=kind: )[^$\s]+/)

                        return ({
                            name: name,
                            kind: 'template',
                            content: t,
                            size: 600
                        })
                    }))
                },
                {
                    name: '', // values
                    children: Object.entries(this.chartDetails.values).map(([k, v]) => ({
                        name: k,
                        kind: 'value',
                        value: v.toString(),
                        content: JSON.stringify(v),
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

                                    if (node.data.kind == 'template') {
                                        nodeStroke = '#AA0000'
                                    } else if (node.data.kind == 'value') {
                                        nodeStroke = '#00AA00'
                                    } else if (node.depth > 2) {
                                        nodeStroke = '#0000AA'
                                    }

                                    return (
                                        <Group
                                            key={`node-${i}`}
                                            top={node.y0 + margin.top}
                                            left={node.x0 + margin.left}
                                            className={node.data.kind}
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
                                                <tspan x="5" dy="1.1em">{node.data.name}</tspan>
                                            </text>
                                        </Group>
                                    )
                                })}
                            </Group>
                    }
                </Treemap>
            </svg>

            <Collapsible trigger="README">
                <MarkdownRenderer markdown={this.chartDetails.readme} />
            </Collapsible>
        </div>)
    }
}

export default HelmChartHierarchy;
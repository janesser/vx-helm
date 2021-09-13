import React, { Children, setState } from 'react';
import Autocomplete from 'react-autocomplete';
import HelmChartHierarchy from './HelmChartHierarchy'

class ChartSelectorForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            repo: { name: null, url: null },
            chartsAvailable: [],
            chart: '',
            chartDetails: null,
            error: null
        }
    }

    validate = (_) => {
        const validForm = document.querySelector(":invalid") == null
        document.getElementById("visualize").disabled = !validForm

        if (validForm)
            fetch("/api/browse?repoName=" + this.state.repo.name + "&repoUrl=" + this.state.repo.url)
                .then(
                    (response) =>
                        response.json().then(
                            (responseJson) => {
                                console.log(responseJson)
                                if (response.status == 200)
                                    this.setState({
                                        chartsAvailable: responseJson.charts
                                    })
                                else
                                    alert(responseJson.error)

                            }
                        )
                )
    }


    visualize = (event) => {
        event.preventDefault();

        fetch("/api/visualize?repoName=" + this.state.repo.name + "&repoUrl=" + this.state.repo.url + "&chart=" + this.state.chart)
            .then((response) => {
                response.json().then((responseJson) => {
                    console.log(responseJson)
                    this.setState({
                        chartDetails: {
                            chartDescription: responseJson.chartDescription,
                            readme: responseJson.readme,
                            values: responseJson.values,
                            templates: responseJson.templates
                        }
                    })
                })
            })
    }

    render() {
        let visualizer
        if (this.state.chartDetails)
            visualizer = (<HelmChartHierarchy chartDetails={this.state.chartDetails} />)
        else
            visualizer = (<span>nothing to visualize yet.</span>)

        return (
            <div>
                <form onSubmit={this.visualize} >
                    <div>
                        <label htmlFor="helm-repo-name">helm-repo-name: </label>
                        <input id="helm-repo-name"
                            type="text"
                            spellCheck="false"
                            onChange={e => this.setState(state => {
                                state.repo.name = e.target.value
                                state
                            })}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="helm-repo-url">helm-repo-url: </label>
                        <input id="helm-repo-url"
                            type="url"
                            pattern="https://[^/]+/.+"
                            spellCheck="false"
                            onChange={e => this.setState(state => {
                                state.repo.url = e.target.value
                                state
                            })}
                            required
                        />
                    </div>
                    <div>
                        <button id="validate"
                            type="button"
                            onClick={this.validate}>Validate</button>
                    </div>
                    <div>
                        <label htmlFor="helm-chart">helm-chart: </label>
                        <Autocomplete
                            id="helm-chart"
                            getItemValue={(item) => item.name.split('/')[1]}
                            items={this.state.chartsAvailable}
                            value={this.state.chart}
                            onSelect={(item) => this.setState({ chart: item })}
                            renderItem={(item, isHighlighted) =>
                                <div
                                    key={item.name}
                                    style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                                    {item.name.split('/')[1] + " " + item.version}
                                </div>
                            }

                            required
                        />
                    </div>
                    <div>
                        <button id="visualize"
                            type="submit"
                            disabled>Visualize!</button>
                    </div>
                </form>
                {visualizer}
            </div>
        );
    }

}

export default ChartSelectorForm;
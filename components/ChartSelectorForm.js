import React from 'react';
import HelmChartHierarchy from './HelmChartHierarchy'

class ChartSelectorForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            repo: { name: null, url: null },
            chart: null,
            chartDetails: null
        }
    }

    validate = (_) => {
        const validForm = document.querySelector(":invalid") == null
        document.getElementById("visualize").disabled = !validForm

        if (validForm)
            fetch("/api/validate?repoName=" + this.state.repo.name + "&repoUrl=" + this.state.repo.url + "&chart=" + this.state.chart)
                .then((response) => console.log(response))
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
                    <p>
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
                    </p>
                    <p>
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
                    </p>
                    <p>
                        <label htmlFor="helm-chart">helm-chart: </label>
                        <input id="helm-chart"
                            type="text"
                            spellCheck="false"
                            onChange={e => this.setState(state => {
                                state.chart = e.target.value
                                state
                            })}
                            required
                        />
                    </p>
                    <p><button id="validate"
                        type="button"
                        onClick={this.validate}>Validate</button>
                        <button id="visualize"
                            type="submit"
                            disabled>Visualize!</button>
                    </p>
                </form>
                {visualizer}
            </div>
        );
    }

}

export default ChartSelectorForm;
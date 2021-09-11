// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { exec } from "child_process"
const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")

export default async function handler(req, res) {
  const chartFQN = req.query.repoName + "/" + req.query.chart

  // helm show chart
  // helm show readme
  // helm show values
  // helm template -g

  exec("helm show chart " + chartFQN, (err, stdout, stderr) => {
    const chartDescription = yaml.safeLoad(stdout)

    if (err)
      res.status(500).json({ chart: chartFQN, error: err + "\n" + stderr })
    else exec("helm show readme " + chartFQN, (err, stdout, stderr) => {
      const readme = stdout

      if (err)
        res.status(500).json({ chart: chartFQN, error: err + "\n" + stderr })
      else exec("helm show values " + chartFQN, (err, stdout, stderr) => {
        const values = yaml.safeLoad(stdout)

        if (err)
          res.status(500).json({ chart: chartFQN, error: err + "\n" + stderr })
        else exec("helm template -g " + chartFQN, (err, stdout, stderr) => {
          const templates = stdout.split(/---[^](?=# Source)/).slice(1)

          if (err)
            res.status(500).json({ chart: chartFQN, error: err + "\n" + stderr })
          else
            res.status(200).json({
              chart: chartFQN,
              chartDescription: chartDescription,
              readme: readme,
              values: values,
              templates: templates
            })
        })
      })
    })
  })
}

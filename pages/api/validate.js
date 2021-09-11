// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { exec } from "child_process"
const fs = require("fs")
const yaml = require("js-yaml")

export default function handler(req, res) {
  const repoName = req.query.repoName
  const repoUrl = req.query.repoUrl
  const chartName = req.query.chart

  exec("helm repo add " + repoName + " " + repoUrl, (error, stdout, stderr) => {
    if (error || stderr)
      res.status(500).json({ repo: repoUrl, error: error + "\n" + stderr })
    else {
      exec("helm template -g " + repoName + "/" + chartName, (error, stdout, stderr) => {
        if (error || stderr)
          res.status(500).json({ repo: repoUrl, chart: chartName, error: error + "\n" + stderr })
        else {
          res.status(200).json({ repo: repoUrl, chart: chartName, chartSample: stdout })
        }
      })
    }
  })
}

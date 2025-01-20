{{/* vim: set filetype=mustache: */}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "hedera-explorer.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "hedera-explorer.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "hedera-explorer.labels" -}}
{{ include "hedera-explorer.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: hedera-explorer
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
helm.sh/chart: {{ include "hedera-explorer.chart" . }}
{{- if .Values.labels }}
{{ toYaml .Values.labels }}
{{- end }}
{{- end -}}

{{/*
Expand the name of the chart.
*/}}
{{- define "hedera-explorer.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Namespace
*/}}
{{- define "hedera-explorer.namespace" -}}
{{- default .Release.Namespace .Values.global.namespaceOverride -}}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "hedera-explorer.selectorLabels" -}}
app.kubernetes.io/component: hedera-explorer
app.kubernetes.io/name: {{ include "hedera-explorer.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "hedera-explorer.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "hedera-explorer.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

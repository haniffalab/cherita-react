import { useMemo } from 'react';

import { Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';

import { useDataset } from '../../context/DatasetContext';
import { useSettings } from '../../context/SettingsContext';
import { useFetch } from '../../utils/requests';

export function ObsExplorer() {
  const settings = useSettings();
  const dataset = useDataset();
  const selectedObsIndex = settings.selectedObsIndex;
  const ENDPOINT = 'obs/rows';
  const OBS_COLS = ['genes', 'GP_name'];

  const params = useMemo(() => {
    if (selectedObsIndex == null) return null;

    return {
      url: dataset.url,
      obsIndices: [selectedObsIndex],
      cols: OBS_COLS,
    };
  }, [dataset.url, selectedObsIndex, OBS_COLS]);

  const { fetchedData, isPending, serverError } = useFetch(ENDPOINT, params, {
    refetchOnMount: false,
    enabled: selectedObsIndex != null,
  });

  const row =
    selectedObsIndex != null && fetchedData
      ? fetchedData[String(selectedObsIndex)]
      : null;

  if (selectedObsIndex == null) {
    return <div className="my-3">Select a gene</div>;
  }

  if (isPending) {
    return (
      <div className="my-3">
        <Spinner animation="border" size="sm" /> Loading…
      </div>
    );
  }

  if (serverError) {
    return (
      <Alert variant="danger" className="my-3">
        {serverError.message}
      </Alert>
    );
  }

  if (!row) {
    return <div className="my-3">No data</div>;
  }

  const gene = {
    symbol: row.genes ?? 'PDE4B',
    name: row.genes ?? 'phosphodiesterase 4B',
    aliases: ['DPDE4', 'PDEIVB'],
    summary:
      'This gene is a member of the type IV, cyclic AMP (cAMP)-specific, cyclic nucleotide phosphodiesterase (PDE) family. The encoded protein regulates the cellular concentrations of cyclic nucleotides and thereby play a role in signal transduction. Altered activity of this protein has been associated with schizophrenia and bipolar affective disorder.',
  };

  const degs = [
    { gene: 'IL6', logFC: 1.8, padj: 1e-6 },
    { gene: 'TNF', logFC: 1.2, padj: 4e-4 },
    { gene: 'CXCL8', logFC: -1.5, padj: 2e-5 },
    { gene: 'IL6', logFC: 1.8, padj: 1e-6 },
    { gene: 'TNF', logFC: 1.2, padj: 4e-4 },
    { gene: 'CXCL8', logFC: -1.5, padj: 2e-5 },
    { gene: 'IL6', logFC: 1.8, padj: 1e-6 },
    { gene: 'TNF', logFC: 1.2, padj: 4e-4 },
    { gene: 'CXCL8', logFC: -1.5, padj: 2e-5 },
    { gene: 'IL6', logFC: 1.8, padj: 1e-6 },
    { gene: 'TNF', logFC: 1.2, padj: 4e-4 },
    { gene: 'CXCL8', logFC: -1.5, padj: 2e-5 },
    { gene: 'IL6', logFC: 1.8, padj: 1e-6 },
    { gene: 'TNF', logFC: 1.2, padj: 4e-4 },
    { gene: 'CXCL8', logFC: -1.5, padj: 2e-5 },
  ];

  return (
    <div className="overflow-auto modern-scrollbars h-100">
      <div className="my-3">
        {/* Gene header */}
        <h4 className="mb-1">
          {gene.symbol}{' '}
          <small className="text-muted fw-normal">({gene.name})</small>
        </h4>
        <div className="mb-2">
          {gene.aliases.map((alias) => (
            <Badge key={alias} bg="secondary" className="me-1">
              {alias}
            </Badge>
          ))}
        </div>
        <p className="mb-2">{gene.summary}</p>
        <Table bordered size="sm">
          <tbody>
            {Object.entries(row).map(([key, value]) => (
              <tr key={key}>
                <th style={{ width: '30%' }}>{key}</th>
                <td>{value ?? <em className="text-muted">NA</em>}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* DEG header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">DEGs Table</h5>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              /* open DEG modal here */
            }}
          >
            Expand
          </Button>
        </div>

        {/* DEG table */}
        <Table striped hover responsive size="sm">
          <thead>
            <tr>
              <th>Gene</th>
              <th>logFC</th>
              <th>adj. p-value</th>
            </tr>
          </thead>
          <tbody>
            {degs.map((row) => (
              <tr key={row.gene}>
                <td>{row.gene}</td>
                <td>{row.logFC.toFixed(2)}</td>
                <td>{row.padj.toExponential(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

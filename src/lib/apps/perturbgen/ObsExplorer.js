import { Table, Badge, Button } from 'react-bootstrap';

import { useSettings } from '../../context/SettingsContext';
import { useZarrData } from '../../context/ZarrDataContext';
import { useLabelObsData } from '../../utils/zarrData';

export function ObsExplorer() {
  const settings = useSettings();
  const { obsData } = useZarrData();
  const labelObsData = useLabelObsData();
  const selectedObsIndex = settings.selectedObsIndex;

  if (selectedObsIndex == null) {
    return <div className="my-3">No gene selected</div>;
  }

  // --- Mocked data (replace later) ---
  const gene = {
    symbol: 'PDE4B',
    name: 'phosphodiesterase 4B',
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

      <p className="mb-4">{gene.summary}</p>

      {/* DEG header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="mb-0">Differentially Expressed Genes</h4>

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
  );
}

import { useState, useMemo, useEffect } from "react";
import { storage } from "./storage.js";
import { Info, Package, Zap, Gauge, ShieldAlert, Layers, Settings2, History, Trash2, FolderOpen, Save, Sparkles } from "lucide-react";

const COLORS = {
  bg: "#14181C",
  panel: "#1B2026",
  panelAlt: "#20262D",
  border: "#2C333B",
  amber: "#E8A33D",
  amberDim: "#8A6526",
  text: "#E8E6E1",
  muted: "#8B92A0",
  mutedDim: "#5B6270",
  danger: "#C15B4A",
  success: "#5FA97C",
};

const MATERIALS = [
  { id: "PLA", label: "PLA", defaultPrice: 89 },
  { id: "PETG", label: "PETG", defaultPrice: 119 },
  { id: "ABS", label: "ABS", defaultPrice: 99 },
  { id: "TPU", label: "TPU", defaultPrice: 149 },
];

function Field({ label, icon: Icon, children, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {Icon && <Icon size={13} color={COLORS.mutedDim} strokeWidth={2} />}
        <label style={{ fontSize: 12, color: COLORS.muted, fontFamily: "'IBM Plex Sans', sans-serif", letterSpacing: "0.01em" }}>
          {label}
        </label>
      </div>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: COLORS.mutedDim, marginTop: 6, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function NumberInput({ value, onChange, suffix, step = 1, min = 0 }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: COLORS.panelAlt,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        padding: "9px 12px",
      }}
    >
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: COLORS.text,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 14,
          width: "100%",
        }}
      />
      {suffix && (
        <span style={{ color: COLORS.mutedDim, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: COLORS.panelAlt,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        padding: "9px 12px",
      }}
    >
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: COLORS.text,
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          width: "100%",
        }}
      />
    </div>
  );
}

function SegButton({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              flex: 1,
              padding: "8px 6px",
              fontSize: 12,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              borderRadius: 6,
              border: `1px solid ${active ? COLORS.amber : COLORS.border}`,
              background: active ? "rgba(232,163,61,0.12)" : COLORS.panelAlt,
              color: active ? COLORS.amber : COLORS.muted,
              cursor: "pointer",
              transition: "border-color 120ms, color 120ms, background 120ms",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Slider({ value, onChange, min, max, step, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, color: COLORS.amber, fontWeight: 600 }}>
          {format ? format(value) : value}
        </span>
      </div>
      <div style={{ position: "relative", height: 4, background: COLORS.border, borderRadius: 2 }}>
        <div
          style={{
            position: "absolute",
            height: 4,
            width: `${pct}%`,
            background: COLORS.amber,
            borderRadius: 2,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute",
            top: -8,
            left: 0,
            width: "100%",
            height: 20,
            margin: 0,
            opacity: 0,
            cursor: "pointer",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -6,
            left: `calc(${pct}% - 8px)`,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: COLORS.amber,
            border: `2px solid ${COLORS.bg}`,
            boxShadow: "0 0 0 1px " + COLORS.amber,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, pct, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
          <span style={{ fontSize: 13, color: COLORS.text, fontFamily: "'IBM Plex Sans', sans-serif" }}>{label}</span>
        </div>
        <span style={{ fontSize: 13, color: COLORS.text, fontFamily: "'IBM Plex Mono', monospace" }}>
          R$ {value.toFixed(2)}
        </span>
      </div>
      <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

const INFO_ITEMS = [
  {
    label: "Nome do projeto",
    o_que_e: "Identificação em texto livre da peça sendo orçada.",
    para_que_serve: "Serve para diferenciar e localizar cálculos salvos futuramente na aba de histórico. Não entra em nenhuma fórmula de custo.",
  },
  {
    label: "Peso total",
    o_que_e: "Peso da peça finalizada, em gramas, considerando suportes e purga.",
    para_que_serve: "Base do cálculo de custo de filamento. Pegue o valor direto do seu slicer (Bambu Studio já mostra o peso estimado pós-fatiamento).",
    recomendado: "Varia por peça — use o valor exato do slicer, não estime.",
  },
  {
    label: "Tempo de impressão",
    o_que_e: "Duração total da impressão, em horas, também estimada pelo slicer.",
    para_que_serve: "Usado para calcular o custo de energia e a depreciação da máquina — ambos são proporcionais ao tempo que a impressora fica em uso.",
    recomendado: "Varia por peça — use o valor exato do slicer, não estime.",
  },
  {
    label: "Material",
    o_que_e: "Tipo de filamento usado na peça (PLA, PETG, ABS, TPU).",
    para_que_serve: "Cada material tem um preço médio por kg diferente. Selecionar o material já preenche o preço padrão configurado em Ajustes.",
    recomendado: "PLA para peças decorativas; PETG/ABS para peças funcionais ou uso externo.",
  },
  {
    label: "Preço filamento",
    o_que_e: "Valor pago por kg do rolo de filamento.",
    para_que_serve: "Multiplicado pelo peso da peça (em kg) dá o custo direto de material. Pode ser ajustado por peça se você tiver rolos de marcas/preços diferentes.",
  },
  {
    label: "Tarifa de energia",
    o_que_e: "Valor cobrado por kWh consumido, incluindo tributos (ICMS, PIS/COFINS).",
    para_que_serve: "Tire da sua própria conta de luz: total pago na linha de consumo dividido pelo consumo em kWh. É o número mais preciso, já que agrega bandeira tarifária e impostos do seu ciclo real.",
    como_obter: "Na conta de luz: some os valores em R$ de Consumo TE + TUSD + Bandeira, e divida pelo \"Total Apurado\" em kWh. Não inclua COSIP nem juros/multa.",
  },
  {
    label: "Potência média",
    o_que_e: "Consumo médio da impressora em Watts durante a impressão, não o pico de aquecimento.",
    para_que_serve: "Junto com o tempo de impressão e a tarifa, calcula o custo real de energia elétrica. Medir com uma tomada inteligente (Tapo P110, Sonoff) dá um valor mais confiável que o datasheet.",
    como_obter: "Consulte a ficha técnica/especificações do fabricante da impressora (site oficial ou manual) e use a potência média de operação informada — não o pico de aquecimento da mesa/bico.",
  },
  {
    label: "Preço da impressora",
    o_que_e: "Valor pago pelo equipamento (impressora + acessórios, como a AMS).",
    para_que_serve: "Base para calcular a depreciação por hora de uso — parte do investimento que cada impressão deveria, em teoria, devolver.",
    recomendado: "Valor real de compra (impressora + AMS). Ex.: A1 + AMS Lite ≈ R$5.500–6.500.",
  },
  {
    label: "Vida útil estimada",
    o_que_e: "Quantidade de horas de operação que você espera tirar da impressora antes de considerá-la amortizada.",
    para_que_serve: "Preço da impressora dividido pela vida útil dá a depreciação por hora, que é multiplicada pelo tempo de cada impressão.",
    recomendado: "15.000–20.000h — referência comum para FDM com uso e manutenção regulares.",
  },
  {
    label: "Custos extras",
    o_que_e: "Itens agregados à peça que não são filamento: ímãs, insertos rosqueados, parafusos, etc.",
    para_que_serve: "Soma direta ao custo total. Ajuste por peça conforme o que ela realmente leva.",
    recomendado: "R$0–5 — depende inteiramente da peça; deixe 0 como base e ajuste quando houver hardware.",
  },
  {
    label: "Embalagem",
    o_que_e: "Custo de embalar a peça pra envio ou entrega (saco, caixa, plástico bolha).",
    para_que_serve: "Soma direta ao custo total, junto com custos extras.",
    recomendado: "R$1,50–3,00 — saco + etiqueta para a maioria das peças pequenas/médias.",
  },
  {
    label: "Margem de risco de falha",
    o_que_e: "Percentual aplicado sobre o custo direto para cobrir impressões que falham (entupimento, warping, queda de energia).",
    para_que_serve: "Sem essa margem, cada falha de impressão sai do seu bolso sem ser recuperada no preço de venda. Escala proporcionalmente ao custo da peça.",
    recomendado: "5% para impressora com mesa calibrada e histórico estável de sucesso.",
  },
  {
    label: "Markup",
    o_que_e: "Percentual aplicado sobre o custo total para chegar no preço de venda sugerido.",
    para_que_serve: "Fórmula: preço = custo × (1 + markup). Diferente de margem — markup é sobre o custo, margem é sobre o preço de venda.",
    recomendado: "100–150% — 125% equivale a ~55,6% de margem líquida, faixa saudável para peça vendida em marketplace.",
  },
  {
    label: "Margem líquida mínima",
    o_que_e: "Percentual mínimo do preço de venda que deve sobrar como lucro líquido.",
    para_que_serve: "Trava de segurança independente do markup: avisa quando, na prática, a margem real ficou abaixo do piso aceitável (útil quando você reduz o markup manualmente numa negociação).",
    recomendado: "30% — cobre comissão de marketplace (~14–20%), frete não recuperado e ainda deixa lucro real.",
  },
];

const DEFAULTS_INICIAIS = {
  tarifaKwh: 0.95,
  potenciaW: 200,
  precoImpressora: 6000,
  vidaUtilH: 20000,
  custosExtras: 2,
  embalagem: 2,
  riscoPct: 5,
  markup: 125,
  margemMinimaPct: 30,
};

export default function Calc3D() {
  const [tab, setTab] = useState("calc");
  const [defaults, setDefaults] = useState(DEFAULTS_INICIAIS);
  const [materiais, setMateriais] = useState(MATERIALS);

  const [nomeProjeto, setNomeProjeto] = useState("");
  const [pesoG, setPesoG] = useState(48.8);
  const [tempoH, setTempoH] = useState(2.05);
  const [material, setMaterial] = useState("PLA");
  const [precoKg, setPrecoKg] = useState(89);
  const [tarifaKwh, setTarifaKwh] = useState(defaults.tarifaKwh);
  const [potenciaW, setPotenciaW] = useState(defaults.potenciaW);
  const [precoImpressora, setPrecoImpressora] = useState(defaults.precoImpressora);
  const [vidaUtilH, setVidaUtilH] = useState(defaults.vidaUtilH);
  const [riscoPct, setRiscoPct] = useState(defaults.riscoPct);
  const [custosExtras, setCustosExtras] = useState(defaults.custosExtras);
  const [embalagem, setEmbalagem] = useState(defaults.embalagem);
  const [markup, setMarkup] = useState(defaults.markup);
  const [margemMinimaPct, setMargemMinimaPct] = useState(defaults.margemMinimaPct);

  function updateDefault(key, value) {
    setDefaults((prev) => ({ ...prev, [key]: value }));
  }

  function updateMaterialPrice(id, value) {
    setMateriais((prev) => prev.map((m) => (m.id === id ? { ...m, defaultPrice: value } : m)));
  }

  function aplicarPadroes() {
    setTarifaKwh(defaults.tarifaKwh);
    setPotenciaW(defaults.potenciaW);
    setPrecoImpressora(defaults.precoImpressora);
    setVidaUtilH(defaults.vidaUtilH);
    setRiscoPct(defaults.riscoPct);
    setCustosExtras(defaults.custosExtras);
    setEmbalagem(defaults.embalagem);
    setMarkup(defaults.markup);
    setMargemMinimaPct(defaults.margemMinimaPct);
    const m = materiais.find((x) => x.id === material);
    if (m) setPrecoKg(m.defaultPrice);
    setTab("calc");
  }

  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [salvandoHistorico, setSalvandoHistorico] = useState(false);
  const [statusSalvar, setStatusSalvar] = useState(null);

  async function carregarHistorico() {
    setCarregandoHistorico(true);
    try {
      const res = await storage.get("historico", false);
      const arr = res && res.value ? JSON.parse(res.value) : [];
      setHistorico(Array.isArray(arr) ? arr : []);
    } catch (e) {
      setHistorico([]);
    } finally {
      setCarregandoHistorico(false);
    }
  }

  useEffect(() => {
    if (tab === "historico") carregarHistorico();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function salvarNoHistorico() {
    setSalvandoHistorico(true);
    setStatusSalvar(null);
    try {
      let arr = [];
      try {
        const res = await storage.get("historico", false);
        arr = res && res.value ? JSON.parse(res.value) : [];
      } catch (e) {
        arr = [];
      }
      const novoItem = {
        id: `${Date.now()}`,
        nome: nomeProjeto.trim() || "Sem nome",
        dataISO: new Date().toISOString(),
        pesoG,
        tempoH,
        material,
        precoKg,
        custoTotal: calc.custoTotal,
        precoSugerido: calc.precoSugerido,
        margemAtual: calc.margemAtual,
      };
      const novoArr = [novoItem, ...arr].slice(0, 100);
      const salvo = await storage.set("historico", JSON.stringify(novoArr), false);
      if (!salvo) throw new Error("Falha ao salvar");
      setHistorico(novoArr);
      setStatusSalvar("ok");
    } catch (e) {
      setStatusSalvar("erro");
    } finally {
      setSalvandoHistorico(false);
      setTimeout(() => setStatusSalvar(null), 2500);
    }
  }

  async function removerDoHistorico(id) {
    const novoArr = historico.filter((h) => h.id !== id);
    setHistorico(novoArr);
    try {
      await storage.set("historico", JSON.stringify(novoArr), false);
    } catch (e) {
      carregarHistorico();
    }
  }

  function carregarProjeto(item) {
    setNomeProjeto(item.nome === "Sem nome" ? "" : item.nome);
    setPesoG(item.pesoG);
    setTempoH(item.tempoH);
    setMaterial(item.material);
    setPrecoKg(item.precoKg);
    setTab("calc");
  }

  function gerarNomeProjeto() {
    const agora = new Date();
    const dataStr = agora.toLocaleDateString("pt-BR").split("/").join("");
    const horaStr = agora.toTimeString().slice(0, 5).replace(":", "");
    setNomeProjeto(`${material}-${pesoG}g-${dataStr}${horaStr}`);
  }

  const calc = useMemo(() => {
    const custoFilamento = (pesoG / 1000) * precoKg;
    const custoEnergia = (potenciaW / 1000) * tempoH * tarifaKwh;
    const depreciacaoHora = vidaUtilH > 0 ? precoImpressora / vidaUtilH : 0;
    const custoMaquina = depreciacaoHora * tempoH;
    const custoDireto = custoFilamento + custoEnergia + custoMaquina + custosExtras + embalagem;
    const custoRisco = custoDireto * (riscoPct / 100);
    const custoTotal = custoDireto + custoRisco;
    const precoSugerido = custoTotal * (1 + markup / 100);
    const lucro = precoSugerido - custoTotal;
    const margemAtual = precoSugerido > 0 ? lucro / precoSugerido : 0;
    const margemOk = margemAtual >= margemMinimaPct / 100;
    const precoParaMargemMinima = margemMinimaPct < 100 ? custoTotal / (1 - margemMinimaPct / 100) : Infinity;

    return {
      custoFilamento,
      custoEnergia,
      custoMaquina,
      custosExtras,
      embalagem,
      custoRisco,
      custoTotal,
      precoSugerido,
      lucro,
      margemAtual,
      margemOk,
      precoParaMargemMinima,
    };
  }, [pesoG, tempoH, precoKg, tarifaKwh, potenciaW, precoImpressora, vidaUtilH, riscoPct, custosExtras, embalagem, markup, margemMinimaPct]);

  const rows = [
    { label: "Filamento", value: calc.custoFilamento, color: "#5B8FE0" },
    { label: "Energia", value: calc.custoEnergia, color: COLORS.amber },
    { label: "Depreciação máquina", value: calc.custoMaquina, color: "#A96FE0" },
    { label: "Risco de falha", value: calc.custoRisco, color: COLORS.danger },
    { label: "Extras + embalagem", value: calc.custosExtras + calc.embalagem, color: COLORS.mutedDim },
  ];
  const maxRow = Math.max(...rows.map((r) => r.value), 0.01);

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        padding: "32px 20px",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
      />
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: COLORS.text, margin: 0 }}>
              Betozo Store - Custo de impressão 3D
            </h1>
          </div>
          <div style={{ display: "flex", gap: 4, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 4 }}>
            {[
              { id: "calc", label: "Calculadora" },
              { id: "historico", label: "Histórico" },
              { id: "ajustes", label: "Ajustes" },
              { id: "info", label: "Informativos" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "7px 16px",
                  fontSize: 12,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  borderRadius: 5,
                  border: "none",
                  background: tab === t.id ? COLORS.panelAlt : "transparent",
                  color: tab === t.id ? COLORS.amber : COLORS.muted,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 760px) {
            .grid-3d-calc { grid-template-columns: 1fr !important; }
            .grid-3d-info { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 480px) {
            .grid-3d-materiais { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {tab === "calc" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="grid-3d-calc">

          {/* PAINEL DE ENTRADA */}
          <div
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
              <Settings2 size={15} color={COLORS.amber} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.text, letterSpacing: "0.02em" }}>
                Parâmetros da peça
              </span>
            </div>

            <Field label="Nome do projeto" hint="usado para identificar essa peça no histórico">
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <TextInput value={nomeProjeto} onChange={setNomeProjeto} placeholder="Ex: Vaso Geométrico" />
                </div>
                <button
                  onClick={gerarNomeProjeto}
                  title="Gerar nome automático"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 38,
                    flexShrink: 0,
                    borderRadius: 6,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.panelAlt,
                    color: COLORS.amber,
                    cursor: "pointer",
                  }}
                >
                  <Sparkles size={15} />
                </button>
              </div>
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Peso total" icon={Package}>
                <NumberInput value={pesoG} onChange={setPesoG} suffix="g" step={0.1} />
              </Field>
              <Field label="Tempo de impressão" icon={Gauge}>
                <NumberInput value={tempoH} onChange={setTempoH} suffix="h" step={0.05} />
              </Field>
            </div>

            <Field label="Material" icon={Layers}>
              <SegButton
                options={materiais.map((m) => ({ id: m.id, label: m.label }))}
                value={material}
                onChange={(id) => {
                  setMaterial(id);
                  const m = materiais.find((x) => x.id === id);
                  if (m) setPrecoKg(m.defaultPrice);
                }}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Preço filamento" hint="por kg">
                <NumberInput value={precoKg} onChange={setPrecoKg} suffix="R$" step={1} />
              </Field>
              <Field label="Tarifa de energia" icon={Zap} hint="tirada da sua conta CELESC">
                <NumberInput value={tarifaKwh} onChange={setTarifaKwh} suffix="R$/kWh" step={0.01} />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Potência média" hint="A1 + AMS em regime">
                <NumberInput value={potenciaW} onChange={setPotenciaW} suffix="W" step={5} />
              </Field>
              <Field label="Preço da impressora">
                <NumberInput value={precoImpressora} onChange={setPrecoImpressora} suffix="R$" step={50} />
              </Field>
            </div>

            <Field label="Vida útil estimada" hint="horas de operação antes de considerar a máquina amortizada">
              <NumberInput value={vidaUtilH} onChange={setVidaUtilH} suffix="h" step={100} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Custos extras" hint="ímãs, insertos, etc.">
                <NumberInput value={custosExtras} onChange={setCustosExtras} suffix="R$" step={0.5} />
              </Field>
              <Field label="Embalagem">
                <NumberInput value={embalagem} onChange={setEmbalagem} suffix="R$" step={0.5} />
              </Field>
            </div>

            <Field label="Margem de risco de falha" icon={ShieldAlert} hint="% do custo direto reservado para reimpressões">
              <NumberInput value={riscoPct} onChange={setRiscoPct} suffix="%" step={1} />
            </Field>
          </div>

          {/* PAINEL DE RESULTADO */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: COLORS.panel,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: 24,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.02em", marginBottom: 6 }}>
                    Preço sugerido
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 42,
                      fontWeight: 600,
                      color: COLORS.amber,
                      lineHeight: 1,
                    }}
                  >
                    R$ {calc.precoSugerido.toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>Custo total</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: COLORS.text }}>
                    R$ {calc.custoTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>Markup</div>
                <NumberInput value={markup} onChange={setMarkup} suffix="%" step={5} />
              </div>

              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: COLORS.muted }}>Lucro líquido</span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 15,
                    color: calc.margemOk ? COLORS.success : COLORS.danger,
                  }}
                >
                  R$ {calc.lucro.toFixed(2)} <span style={{ color: COLORS.muted, fontSize: 12 }}>({(calc.margemAtual * 100).toFixed(1)}%)</span>
                </span>
              </div>

              <button
                onClick={salvarNoHistorico}
                disabled={salvandoHistorico}
                style={{
                  marginTop: 16,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 16px",
                  fontSize: 13,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  borderRadius: 7,
                  border: `1px solid ${statusSalvar === "ok" ? COLORS.success : COLORS.border}`,
                  background: statusSalvar === "ok" ? "rgba(95,169,124,0.12)" : COLORS.panelAlt,
                  color: statusSalvar === "ok" ? COLORS.success : COLORS.text,
                  cursor: salvandoHistorico ? "default" : "pointer",
                  opacity: salvandoHistorico ? 0.6 : 1,
                }}
              >
                <Save size={14} />
                {salvandoHistorico ? "Salvando..." : statusSalvar === "ok" ? "Salvo no histórico" : statusSalvar === "erro" ? "Erro ao salvar — tente de novo" : "Salvar no histórico"}
              </button>
            </div>

            {!calc.margemOk && (
              <div
                style={{
                  background: "rgba(193,91,74,0.1)",
                  border: `1px solid ${COLORS.danger}`,
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <ShieldAlert size={14} color={COLORS.danger} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.danger }}>
                    Margem abaixo do mínimo
                  </span>
                </div>
                <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 10px" }}>
                  A margem líquida atual ({(calc.margemAtual * 100).toFixed(1)}%) está abaixo do mínimo configurado de {margemMinimaPct}%.
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <NumberInput value={margemMinimaPct} onChange={setMargemMinimaPct} suffix="% mín." step={1} />
                  <span
                    style={{
                      marginLeft: 12,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 14,
                      color: COLORS.text,
                      whiteSpace: "nowrap",
                    }}
                  >
                    → R$ {calc.precoParaMargemMinima.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div
              style={{
                background: COLORS.panel,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <Info size={13} color={COLORS.mutedDim} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                  Composição do custo
                </span>
              </div>
              {rows.map((r) => (
                <BreakdownRow key={r.label} label={r.label} value={r.value} pct={(r.value / maxRow) * 100} color={r.color} />
              ))}
            </div>
          </div>
        </div>
        )}

        {tab === "historico" && (
          <div
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <History size={15} color={COLORS.amber} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.text, letterSpacing: "0.02em" }}>
                Projetos salvos
              </span>
            </div>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 22px" }}>
              Cálculos salvos na aba Calculadora. Fica guardado só neste dispositivo/conta.
            </p>

            {carregandoHistorico && (
              <p style={{ fontSize: 13, color: COLORS.muted }}>Carregando...</p>
            )}

            {!carregandoHistorico && historico.length === 0 && (
              <div
                style={{
                  border: `1px dashed ${COLORS.border}`,
                  borderRadius: 8,
                  padding: "32px 20px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>
                  Nenhum projeto salvo ainda. Calcule uma peça na aba Calculadora e clique em "Salvar no histórico".
                </p>
              </div>
            )}

            {!carregandoHistorico && historico.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {historico.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "14px 16px",
                      background: COLORS.panelAlt,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 160 }}>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: COLORS.text }}>
                        {item.nome}
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.mutedDim, marginTop: 2 }}>
                        {new Date(item.dataISO).toLocaleDateString("pt-BR")} · {item.material} · {item.pesoG}g · {item.tempoH}h
                      </div>
                    </div>

                    <div style={{ textAlign: "right", minWidth: 90 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: COLORS.amber, fontWeight: 600 }}>
                        R$ {item.precoSugerido.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 11, color: COLORS.mutedDim }}>
                        margem {(item.margemAtual * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => carregarProjeto(item)}
                        title="Carregar na calculadora"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          border: `1px solid ${COLORS.border}`,
                          background: "transparent",
                          color: COLORS.muted,
                          cursor: "pointer",
                        }}
                      >
                        <FolderOpen size={14} />
                      </button>
                      <button
                        onClick={() => removerDoHistorico(item.id)}
                        title="Remover"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          border: `1px solid ${COLORS.border}`,
                          background: "transparent",
                          color: COLORS.danger,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "ajustes" && (
          <div
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Settings2 size={15} color={COLORS.amber} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.text, letterSpacing: "0.02em" }}>
                Valores pré-fixados
              </span>
            </div>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 22px" }}>
              Define o que a calculadora carrega por padrão. Não afeta o cálculo atual até você aplicar.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Tarifa de energia" icon={Zap} hint="R$/kWh, tirada da conta CELESC">
                <NumberInput value={defaults.tarifaKwh} onChange={(v) => updateDefault("tarifaKwh", v)} suffix="R$/kWh" step={0.01} />
              </Field>
              <Field label="Potência média" hint="impressora + AMS em regime">
                <NumberInput value={defaults.potenciaW} onChange={(v) => updateDefault("potenciaW", v)} suffix="W" step={5} />
              </Field>
              <Field label="Preço da impressora">
                <NumberInput value={defaults.precoImpressora} onChange={(v) => updateDefault("precoImpressora", v)} suffix="R$" step={50} />
              </Field>
              <Field label="Vida útil estimada" hint="horas até considerar amortizada">
                <NumberInput value={defaults.vidaUtilH} onChange={(v) => updateDefault("vidaUtilH", v)} suffix="h" step={100} />
              </Field>
              <Field label="Custos extras" hint="ímãs, insertos, etc.">
                <NumberInput value={defaults.custosExtras} onChange={(v) => updateDefault("custosExtras", v)} suffix="R$" step={0.5} />
              </Field>
              <Field label="Embalagem">
                <NumberInput value={defaults.embalagem} onChange={(v) => updateDefault("embalagem", v)} suffix="R$" step={0.5} />
              </Field>
              <Field label="Margem de risco de falha" icon={ShieldAlert} hint="% do custo direto">
                <NumberInput value={defaults.riscoPct} onChange={(v) => updateDefault("riscoPct", v)} suffix="%" step={1} />
              </Field>
              <Field label="Markup">
                <NumberInput value={defaults.markup} onChange={(v) => updateDefault("markup", v)} suffix="%" step={5} />
              </Field>
              <Field label="Margem líquida mínima" hint="% do preço de venda">
                <NumberInput value={defaults.margemMinimaPct} onChange={(v) => updateDefault("margemMinimaPct", v)} suffix="%" step={1} />
              </Field>
            </div>

            <div style={{ marginTop: 8, paddingTop: 20, borderTop: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Layers size={14} color={COLORS.mutedDim} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                  Preço padrão por material
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }} className="grid-3d-materiais">
                {materiais.map((m) => (
                  <Field key={m.id} label={m.label} hint="R$/kg">
                    <NumberInput value={m.defaultPrice} onChange={(v) => updateMaterialPrice(m.id, v)} suffix="R$" step={1} />
                  </Field>
                ))}
              </div>
            </div>

            <button
              onClick={aplicarPadroes}
              style={{
                marginTop: 8,
                padding: "10px 20px",
                fontSize: 13,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                borderRadius: 7,
                border: `1px solid ${COLORS.amber}`,
                background: "rgba(232,163,61,0.12)",
                color: COLORS.amber,
                cursor: "pointer",
              }}
            >
              Aplicar aos campos atuais
            </button>
          </div>
        )}

        {tab === "info" && (
          <div
            style={{
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Info size={15} color={COLORS.amber} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.text, letterSpacing: "0.02em" }}>
                O que é cada campo
              </span>
            </div>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 22px" }}>
              Referência rápida dos campos que aparecem em Calculadora e Ajustes.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {INFO_ITEMS.map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    padding: "16px 0",
                    borderTop: i === 0 ? "none" : `1px solid ${COLORS.border}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.amber,
                      marginBottom: 8,
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="grid-3d-info">
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.mutedDim, marginBottom: 4 }}>O que é</div>
                      <p style={{ fontSize: 13, color: COLORS.text, margin: 0, lineHeight: 1.5 }}>{item.o_que_e}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.mutedDim, marginBottom: 4 }}>Para que serve</div>
                      <p style={{ fontSize: 13, color: COLORS.text, margin: 0, lineHeight: 1.5 }}>{item.para_que_serve}</p>
                    </div>
                  </div>
                  {item.recomendado && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${COLORS.border}` }}>
                      <div style={{ fontSize: 11, color: COLORS.mutedDim, marginBottom: 4 }}>Valor recomendado</div>
                      <p style={{ fontSize: 13, color: COLORS.amber, margin: 0, lineHeight: 1.5, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {item.recomendado}
                      </p>
                    </div>
                  )}
                  {item.como_obter && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${COLORS.border}` }}>
                      <div style={{ fontSize: 11, color: COLORS.mutedDim, marginBottom: 4 }}>Como obter esse valor</div>
                      <p style={{ fontSize: 13, color: COLORS.amber, margin: 0, lineHeight: 1.5 }}>
                        {item.como_obter}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

--
-- PostgreSQL database dump
--

\restrict vJ7N4uQcuXdbj2Aj2bhpMf6zKUGZXAXrbsfusK5I5856aP9tejebDzvYsIGTp6J

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cliente (
    id bigint NOT NULL,
    nome character varying(120) NOT NULL,
    telefone character varying(30) NOT NULL,
    local character varying(200),
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cliente_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cliente_id_seq OWNED BY public.cliente.id;


--
-- Name: item_pedido; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.item_pedido (
    id bigint NOT NULL,
    pedido_id bigint NOT NULL,
    produto_id bigint NOT NULL,
    quantidade integer NOT NULL,
    preco_unitario numeric(10,2) NOT NULL,
    CONSTRAINT item_pedido_preco_unitario_check CHECK ((preco_unitario >= (0)::numeric)),
    CONSTRAINT item_pedido_quantidade_check CHECK ((quantidade > 0))
);


--
-- Name: item_pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.item_pedido_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: item_pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.item_pedido_id_seq OWNED BY public.item_pedido.id;


--
-- Name: pedido; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido (
    id bigint NOT NULL,
    cliente_id bigint NOT NULL,
    data_pedido timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_encomenda date NOT NULL,
    status character varying(30) DEFAULT 'RECEBIDO'::character varying NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    CONSTRAINT chk_status_pedido CHECK (((status)::text = ANY ((ARRAY['RECEBIDO'::character varying, 'EM_PREPARO'::character varying, 'PRONTO'::character varying, 'CONCLUIDO'::character varying, 'CANCELADO'::character varying])::text[]))),
    CONSTRAINT pedido_total_check CHECK ((total >= (0)::numeric))
);


--
-- Name: pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedido_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedido_id_seq OWNED BY public.pedido.id;


--
-- Name: produto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.produto (
    id bigint NOT NULL,
    nome character varying(120) NOT NULL,
    descricao character varying(255),
    preco numeric(10,2) NOT NULL,
    disponivel boolean DEFAULT true NOT NULL,
    sabor_id bigint NOT NULL,
    CONSTRAINT produto_preco_check CHECK ((preco >= (0)::numeric))
);


--
-- Name: produto_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.produto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: produto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.produto_id_seq OWNED BY public.produto.id;


--
-- Name: sabor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sabor (
    id bigint NOT NULL,
    nome character varying(100) NOT NULL,
    descricao character varying(255),
    ativo boolean DEFAULT true NOT NULL
);


--
-- Name: sabor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sabor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sabor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sabor_id_seq OWNED BY public.sabor.id;


--
-- Name: usuario_admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario_admin (
    id bigint NOT NULL,
    nome character varying(120) NOT NULL,
    email character varying(150) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: usuario_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuario_admin_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuario_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuario_admin_id_seq OWNED BY public.usuario_admin.id;


--
-- Name: cliente id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente ALTER COLUMN id SET DEFAULT nextval('public.cliente_id_seq'::regclass);


--
-- Name: item_pedido id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_pedido ALTER COLUMN id SET DEFAULT nextval('public.item_pedido_id_seq'::regclass);


--
-- Name: pedido id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido ALTER COLUMN id SET DEFAULT nextval('public.pedido_id_seq'::regclass);


--
-- Name: produto id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produto ALTER COLUMN id SET DEFAULT nextval('public.produto_id_seq'::regclass);


--
-- Name: sabor id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sabor ALTER COLUMN id SET DEFAULT nextval('public.sabor_id_seq'::regclass);


--
-- Name: usuario_admin id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_admin ALTER COLUMN id SET DEFAULT nextval('public.usuario_admin_id_seq'::regclass);


--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cliente (id, nome, telefone, local, criado_em) FROM stdin;
1	Ana Teste	24999999999	Resende	2026-09-16 18:20:47.478673
2	Ana (teste)	24999484601	Endereço Teste	2026-09-16 18:25:56.189822
3	Cliente Teste A	24999990001	Empresa A	2026-09-16 18:43:46.808068
4	Cliente Teste B	24999990002	Empresa B	2026-09-16 18:44:14.758141
5	Teste	Teste	Teste	2026-09-16 19:09:01.66297
6	Cliente Demonstração	249999999	Endereço Demonstração	2026-09-19 19:15:03.357857
\.


--
-- Data for Name: item_pedido; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.item_pedido (id, pedido_id, produto_id, quantidade, preco_unitario) FROM stdin;
1	1	1	3	12.50
2	2	1	1	12.50
3	3	1	3	12.50
4	3	2	2	13.50
5	4	1	4	12.50
6	4	2	5	13.50
7	5	1	1	12.50
8	5	2	1	13.50
9	6	2	2	13.50
10	6	3	1	16.00
\.


--
-- Data for Name: pedido; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedido (id, cliente_id, data_pedido, data_encomenda, status, total) FROM stdin;
1	1	2026-09-16 18:20:47.478673	2026-09-18	RECEBIDO	37.50
2	2	2026-09-16 18:25:56.189822	2026-09-18	RECEBIDO	12.50
4	4	2026-09-16 18:44:14.758141	2026-09-19	RECEBIDO	117.50
5	5	2026-09-16 19:09:01.66297	2026-09-20	RECEBIDO	26.00
3	3	2026-09-16 18:43:46.808068	2026-09-19	EM_PREPARO	64.50
6	6	2026-09-19 19:15:03.357857	2026-09-21	CONCLUIDO	43.00
\.


--
-- Data for Name: produto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.produto (id, nome, descricao, preco, disponivel, sabor_id) FROM stdin;
2	Sanduíche Natural de Atum	Sanduíche natural recheado com atum.	13.50	t	2
3	Sanduíche Natural Especial	Produto criado para teste da implementação.	16.00	t	1
1	Sandu¡che Natural de Frango	Sandu¡che natural recheado com frango	12.50	f	1
4	aaaa	a	1.00	f	2
\.


--
-- Data for Name: sabor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sabor (id, nome, descricao, ativo) FROM stdin;
2	Atum	Sandu�che natural de atum	t
1	Frango	Sandu¡che natural de frango	t
\.


--
-- Data for Name: usuario_admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuario_admin (id, nome, email, senha_hash, criado_em) FROM stdin;
1	Administradora DGC	admin@dgc.local	$2b$10$NEUmp2ai7l0kXgV29DPPte6pT6gk/mfXnmOiZQsOQlz0vRWQzBm5y	2026-09-16 18:52:15.707609
\.


--
-- Name: cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cliente_id_seq', 6, true);


--
-- Name: item_pedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.item_pedido_id_seq', 10, true);


--
-- Name: pedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedido_id_seq', 6, true);


--
-- Name: produto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.produto_id_seq', 4, true);


--
-- Name: sabor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sabor_id_seq', 2, true);


--
-- Name: usuario_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuario_admin_id_seq', 1, true);


--
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id);


--
-- Name: item_pedido item_pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_pedido
    ADD CONSTRAINT item_pedido_pkey PRIMARY KEY (id);


--
-- Name: pedido pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_pkey PRIMARY KEY (id);


--
-- Name: produto produto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produto
    ADD CONSTRAINT produto_pkey PRIMARY KEY (id);


--
-- Name: sabor sabor_nome_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sabor
    ADD CONSTRAINT sabor_nome_key UNIQUE (nome);


--
-- Name: sabor sabor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sabor
    ADD CONSTRAINT sabor_pkey PRIMARY KEY (id);


--
-- Name: usuario_admin usuario_admin_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_admin
    ADD CONSTRAINT usuario_admin_email_key UNIQUE (email);


--
-- Name: usuario_admin usuario_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario_admin
    ADD CONSTRAINT usuario_admin_pkey PRIMARY KEY (id);


--
-- Name: item_pedido fk_item_pedido; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_pedido
    ADD CONSTRAINT fk_item_pedido FOREIGN KEY (pedido_id) REFERENCES public.pedido(id) ON DELETE CASCADE;


--
-- Name: item_pedido fk_item_produto; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_pedido
    ADD CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES public.produto(id);


--
-- Name: pedido fk_pedido_cliente; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id) REFERENCES public.cliente(id);


--
-- Name: produto fk_produto_sabor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produto
    ADD CONSTRAINT fk_produto_sabor FOREIGN KEY (sabor_id) REFERENCES public.sabor(id);


--
-- PostgreSQL database dump complete
--

\unrestrict vJ7N4uQcuXdbj2Aj2bhpMf6zKUGZXAXrbsfusK5I5856aP9tejebDzvYsIGTp6J


--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-07-04 20:48:50

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 872 (class 1247 OID 16655)
-- Name: enum_peminjaman_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_peminjaman_status AS ENUM (
    'Dipinjam',
    'Dikembalikan',
    'Terlambat'
);


ALTER TYPE public.enum_peminjaman_status OWNER TO postgres;

--
-- TOC entry 875 (class 1247 OID 16702)
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_role AS ENUM (
    'admin',
    'student'
);


ALTER TYPE public.enum_users_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16587)
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    id integer NOT NULL,
    kodebuku character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    penerbit character varying(255),
    tahun integer,
    kategori character varying(100),
    image character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.books OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16586)
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.books_id_seq OWNER TO postgres;

--
-- TOC entry 4872 (class 0 OID 0)
-- Dependencies: 217
-- Name: books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;


--
-- TOC entry 222 (class 1259 OID 16613)
-- Name: inventories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventories (
    id integer NOT NULL,
    buku_id integer NOT NULL,
    rak_id integer NOT NULL,
    jumlah integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.inventories OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16612)
-- Name: inventories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventories_id_seq OWNER TO postgres;

--
-- TOC entry 4873 (class 0 OID 0)
-- Dependencies: 221
-- Name: inventories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventories_id_seq OWNED BY public.inventories.id;


--
-- TOC entry 226 (class 1259 OID 16635)
-- Name: peminjaman; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.peminjaman (
    id integer NOT NULL,
    mahasiswa_nim character varying(255) NOT NULL,
    buku_id integer NOT NULL,
    tanggal_pinjam timestamp with time zone,
    tanggal_kembali timestamp with time zone
);


ALTER TABLE public.peminjaman OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16634)
-- Name: peminjaman_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.peminjaman_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.peminjaman_id_seq OWNER TO postgres;

--
-- TOC entry 4874 (class 0 OID 0)
-- Dependencies: 225
-- Name: peminjaman_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.peminjaman_id_seq OWNED BY public.peminjaman.id;


--
-- TOC entry 224 (class 1259 OID 16621)
-- Name: raks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.raks (
    id integer NOT NULL,
    kode_rak character varying(255) NOT NULL,
    lokasi character varying(255) NOT NULL,
    kapasitas integer NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.raks OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16620)
-- Name: raks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.raks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.raks_id_seq OWNER TO postgres;

--
-- TOC entry 4875 (class 0 OID 0)
-- Dependencies: 223
-- Name: raks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.raks_id_seq OWNED BY public.raks.id;


--
-- TOC entry 220 (class 1259 OID 16600)
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id integer NOT NULL,
    nim character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    department character varying(100),
    angkatan integer,
    status character varying(20) DEFAULT 'Aktif'::character varying,
    telephone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.students OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16599)
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO postgres;

--
-- TOC entry 4876 (class 0 OID 0)
-- Dependencies: 219
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- TOC entry 228 (class 1259 OID 16757)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(10) DEFAULT 'student'::character varying,
    student_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'student'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16756)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4877 (class 0 OID 0)
-- Dependencies: 227
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4672 (class 2604 OID 16590)
-- Name: books id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);


--
-- TOC entry 4679 (class 2604 OID 16616)
-- Name: inventories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventories ALTER COLUMN id SET DEFAULT nextval('public.inventories_id_seq'::regclass);


--
-- TOC entry 4682 (class 2604 OID 16638)
-- Name: peminjaman id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peminjaman ALTER COLUMN id SET DEFAULT nextval('public.peminjaman_id_seq'::regclass);


--
-- TOC entry 4681 (class 2604 OID 16624)
-- Name: raks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raks ALTER COLUMN id SET DEFAULT nextval('public.raks_id_seq'::regclass);


--
-- TOC entry 4675 (class 2604 OID 16603)
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- TOC entry 4683 (class 2604 OID 16760)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4856 (class 0 OID 16587)
-- Dependencies: 218
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books (id, kodebuku, title, author, penerbit, tahun, kategori, image, created_at, updated_at) FROM stdin;
4	BK001	BUKU 1	Aglia	Aglia	2000	IT	qr-code (6)-1751633850531-674870745.png	2025-07-04 12:57:19.989	2025-07-04 12:57:19.989
\.


--
-- TOC entry 4860 (class 0 OID 16613)
-- Dependencies: 222
-- Data for Name: inventories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventories (id, buku_id, rak_id, jumlah, created_at, updated_at) FROM stdin;
7	4	3	1	2025-07-04 19:57:55.887+07	2025-07-04 19:57:55.888+07
\.


--
-- TOC entry 4864 (class 0 OID 16635)
-- Dependencies: 226
-- Data for Name: peminjaman; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.peminjaman (id, mahasiswa_nim, buku_id, tanggal_pinjam, tanggal_kembali) FROM stdin;
\.


--
-- TOC entry 4862 (class 0 OID 16621)
-- Dependencies: 224
-- Data for Name: raks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.raks (id, kode_rak, lokasi, kapasitas, created_at, updated_at) FROM stdin;
3	A001	KK	2	2025-07-04 19:57:49.463+07	2025-07-04 19:57:49.463+07
\.


--
-- TOC entry 4858 (class 0 OID 16600)
-- Dependencies: 220
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, nim, name, department, angkatan, status, telephone, created_at, updated_at) FROM stdin;
1	123456789	Aglia	IT	2001	Aktif	08888888	2025-07-03 03:12:16.226	2025-07-03 03:12:16.226
\.


--
-- TOC entry 4866 (class 0 OID 16757)
-- Dependencies: 228
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role, student_id, created_at, updated_at) FROM stdin;
2	admin	$2b$10$OIxIXWy6qh4p6YGKhOtf9Ou7d4fTbW9.BEYGhmRuWv3nIcopLtKlW	admin	\N	2025-07-04 12:29:19.570622	2025-07-04 12:29:19.570622
3	mahasiswa	$2b$10$ydjDQUG3/TyYGJl1uodv.ui28G22Kajmq1dOvExhDu6dRktI8V0vS	student	123456789	2025-07-04 12:29:47.772086	2025-07-04 12:29:47.772086
\.


--
-- TOC entry 4878 (class 0 OID 0)
-- Dependencies: 217
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.books_id_seq', 4, true);


--
-- TOC entry 4879 (class 0 OID 0)
-- Dependencies: 221
-- Name: inventories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventories_id_seq', 7, true);


--
-- TOC entry 4880 (class 0 OID 0)
-- Dependencies: 225
-- Name: peminjaman_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.peminjaman_id_seq', 25, true);


--
-- TOC entry 4881 (class 0 OID 0)
-- Dependencies: 223
-- Name: raks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.raks_id_seq', 3, true);


--
-- TOC entry 4882 (class 0 OID 0)
-- Dependencies: 219
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_id_seq', 1, true);


--
-- TOC entry 4883 (class 0 OID 0)
-- Dependencies: 227
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- TOC entry 4689 (class 2606 OID 16598)
-- Name: books books_kodebuku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_kodebuku_key UNIQUE (kodebuku);


--
-- TOC entry 4691 (class 2606 OID 16596)
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- TOC entry 4697 (class 2606 OID 16619)
-- Name: inventories inventories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT inventories_pkey PRIMARY KEY (id);


--
-- TOC entry 4705 (class 2606 OID 16640)
-- Name: peminjaman peminjaman_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peminjaman
    ADD CONSTRAINT peminjaman_pkey PRIMARY KEY (id);


--
-- TOC entry 4699 (class 2606 OID 16630)
-- Name: raks raks_kode_rak_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raks
    ADD CONSTRAINT raks_kode_rak_key UNIQUE (kode_rak);


--
-- TOC entry 4701 (class 2606 OID 16628)
-- Name: raks raks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raks
    ADD CONSTRAINT raks_pkey PRIMARY KEY (id);


--
-- TOC entry 4693 (class 2606 OID 16610)
-- Name: students students_nim_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_nim_key UNIQUE (nim);


--
-- TOC entry 4695 (class 2606 OID 16608)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- TOC entry 4707 (class 2606 OID 16768)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4709 (class 2606 OID 16770)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4702 (class 1259 OID 16662)
-- Name: peminjaman_buku_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX peminjaman_buku_id ON public.peminjaman USING btree (buku_id);


--
-- TOC entry 4703 (class 1259 OID 16661)
-- Name: peminjaman_mahasiswa_nim; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX peminjaman_mahasiswa_nim ON public.peminjaman USING btree (mahasiswa_nim);


-- Completed on 2025-07-04 20:48:50

--
-- PostgreSQL database dump complete
--


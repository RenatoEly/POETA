
CREATE OR REPLACE TABLE ALUNO (
	ID_ALUNO INTEGER PRIMARY KEY,
	NOME VARCHAR(30),
	SEXO ENUM('F','M'),
	ESTADO_CIVIL ENUM('SOLTEIRO', 'CASADO'),
	REDE_ESCOLAR ENUM('PARTICULAR','PUBLICA'),
	IDADE INTEGER
);

CREATE OR REPLACE TABLE ATIVIDADE(
	ID_ATIVIDADE INTEGER PRIMARY KEY,
	DESC_ATIVIDADE VARCHAR(30)
);

CREATE OR REPLACE TABLE CURSO(
	ID_CURSO INTEGER PRIMARY KEY,
	DESC_CURSO VARCHAR(30)
);

CREATE OR REPLACE TABLE NO(
	ID_NO INTEGER PRIMARY KEY AUTO_INCREMENT,
	ID_CURSO INTEGER,
	ID_ALUNO INTEGER,
	ID_ATIVIDADE INTEGER,
	NOTA FLOAT,
	DATA_INICIO DATE,
	DATA_FIM DATE,
	ORDEM INTEGER,
	CONSTRAINT ID_CURSO_FK FOREIGN KEY (ID_CURSO) REFERENCES CURSO(ID_CURSO),
	CONSTRAINT ID_ALUNO_FK FOREIGN KEY (ID_ALUNO) REFERENCES ALUNO(ID_ALUNO),
	CONSTRAINT ID_ATIVIDADE_FK FOREIGN KEY (ID_ATIVIDADE) REFERENCES ATIVIDADE(ID_ATIVIDADE)
);

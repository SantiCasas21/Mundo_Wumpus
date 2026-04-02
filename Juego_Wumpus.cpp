// =============================================================
//  MUNDO DE WUMPUS  —  Simulación en consola
//  Tablero: 10 x 10  |  Programación estructurada  |  C++ estándar
//  Restricciones: solo arreglos y funciones, sin STL vector, sin POO
// =============================================================

#include <iostream>
#include <cstdlib>   // srand, rand
#include <ctime>     // time
#include <cstring>   // strcmp, strcpy
#include <cstdio>    // sprintf

using namespace std;

// =============================================================
//  CONSTANTES GLOBALES
// =============================================================
const int FILAS      = 10;
const int COLS       = 10;
const int CELDAS     = FILAS * COLS;        // 100
const int MAX_ACCIONES = 600;
const int MAX_LOG      = 60;
const int NUM_POZOS    = 10;

// Símbolos del tablero visible
const char SIM_VACIO    = '.';
const char SIM_AGENTE   = 'A';
const char SIM_WUMPUS   = 'W';
const char SIM_ORO      = 'O';
const char SIM_POZO     = 'P';
const char SIM_VISITADO = 'x';

// Códigos de estado del juego
const int ESTADO_CONTINUA      = 0;
const int ESTADO_GANO          = 1;
const int ESTADO_MURIO_POZO    = 2;
const int ESTADO_MURIO_WUMPUS  = 3;

// =============================================================
//  ESTRUCTURAS DE DATOS
// =============================================================

struct Agente 
{
    int fila;
    int col;
    bool tieneOro;
    int turno;
};

// Tablero interno: estado real del mundo (solo para lógica)
char tableroReal[FILAS][COLS];

// Percepciones calculadas por índice de celda (fila * COLS + col)
bool hayBrisa  [CELDAS];
bool hayHedor  [CELDAS];
bool hayBrillo [CELDAS];
bool visitado  [CELDAS];

// Log de acciones
char logAcciones[MAX_ACCIONES][MAX_LOG];
int  numAcciones;

// El agente
Agente agente;

// Estado actual del juego
int estadoJuego;

// =============================================================
//  FUNCIONES DE UTILIDAD
// =============================================================

// Convierte fila y columna a índice lineal
int idx(int fila, int col) 
{
    return fila * COLS + col;
}

// Verifica si una posición está dentro del tablero
bool dentroDelTablero(int fila, int col) 
{
    return (fila >= 0 && fila < FILAS && col >= 0 && col < COLS);
}

// Agrega un mensaje al log de acciones
void registrarAccion(const char* mensaje) 
{
    if (numAcciones < MAX_ACCIONES) 
    {
        strncpy(logAcciones[numAcciones], mensaje, MAX_LOG - 1);
        logAcciones[numAcciones][MAX_LOG - 1] = '\0';
        numAcciones++;
    }
}

// =============================================================
//  INICIALIZACIÓN
// =============================================================

void inicializarTablero() 
{
    for (int f = 0; f < FILAS; f++) 
    {
        for (int c = 0; c < COLS; c++) 
        {
            tableroReal[f][c] = SIM_VACIO;
        }
    }
}

void inicializarPercepciones() 
{
    for (int i = 0; i < CELDAS; i++) 
    {
        hayBrisa  [i] = false;
        hayHedor  [i] = false;
        hayBrillo [i] = false;
        visitado  [i] = false;
    }
}

void inicializarAgente() 
{
    agente.fila     = FILAS - 1;   // fila 9 (esquina inferior izquierda)
    agente.col      = 0;
    agente.tieneOro = false;
    agente.turno    = 0;
}

void inicializarLog() 
{
    numAcciones = 0;
    for (int i = 0; i < MAX_ACCIONES; i++) 
    {
        logAcciones[i][0] = '\0';
    }
}

// Coloca el Wumpus, el oro y los pozos de forma aleatoria.
// Ninguna entidad puede estar en la celda inicial del agente (9,0).
void colocarEntidades() 
{
    int colocados;

    // --- Wumpus (1) ---
    colocados = 0;
    while (colocados < 1) 
    {
        int f = rand() % FILAS;
        int c = rand() % COLS;

        if (tableroReal[f][c] == SIM_VACIO && !(f == FILAS-1 && c == 0)) 
        {
            tableroReal[f][c] = SIM_WUMPUS;
            colocados++;
        }
    }

    // --- Oro (1) ---
    colocados = 0;
    while (colocados < 1) 
    {
        int f = rand() % FILAS;
        int c = rand() % COLS;

        if (tableroReal[f][c] == SIM_VACIO && !(f == FILAS-1 && c == 0)) 
        {
            tableroReal[f][c] = SIM_ORO;
            colocados++;
        }
    }

    // --- Pozos (10) ---
    colocados = 0;
    while (colocados < NUM_POZOS) 
    {
        int f = rand() % FILAS;
        int c = rand() % COLS;

        if (tableroReal[f][c] == SIM_VACIO && !(f == FILAS-1 && c == 0)) 
        {
            tableroReal[f][c] = SIM_POZO;
            colocados++;
        }
    }
}

// Calcula brisa (adyacente a pozo), hedor (adyacente a Wumpus)
// y brillo (misma celda que oro) para todas las celdas.
void calcularPercepciones() 
{
    // Primero limpiar
    for (int i = 0; i < CELDAS; i++) 
    {
        hayBrisa[i] = false;
        hayHedor[i] = false;
        hayBrillo[i] = false;
    }

    int df[4] = {-1, 1, 0,  0};
    int dc[4] = { 0, 0,-1,  1};

    for (int f = 0; f < FILAS; f++) 
    {
        for (int c = 0; c < COLS; c++) 
        {
            char celda = tableroReal[f][c];

            if (celda == SIM_ORO) 
            {
                hayBrillo[idx(f, c)] = true;
            }

            if (celda == SIM_POZO || celda == SIM_WUMPUS) 
            {
                // Propagar brisa u hedor a las 4 celdas adyacentes
                for (int d = 0; d < 4; d++) 
                {
                    int nf = f + df[d];
                    int nc = c + dc[d];
                    if (dentroDelTablero(nf, nc)) 
                    {
                        if (celda == SIM_POZO)   hayBrisa[idx(nf, nc)] = true;
                        if (celda == SIM_WUMPUS) hayHedor[idx(nf, nc)] = true;
                    }
                }
            }
        }
    }
}

// =============================================================
//  IMPRESIÓN
// =============================================================

// Limpia la consola 
void limpiarConsola() 
{
    cout << "\033[2J\033[H";
}

// Imprime una línea separadora horizontal para la grilla
void imprimirLineaHorizontal() 
{
    cout << "   +";
    for (int c = 0; c < COLS; c++) {
        cout << "---+";
    }
    cout << "\n";
}

// Imprime el tablero completo.
// Muestra el estado real del mundo: todas las entidades visibles.
// La fila 0 del arreglo es la parte SUPERIOR del mapa (norte),
// la fila 9 es la parte INFERIOR (sur) donde inicia el agente.
void imprimirTablero() 
{
    cout << "\n  === MUNDO DE WUMPUS  |  Turno: " << agente.turno << " ===\n\n";

    // Encabezado de columnas
    cout << "     ";
    for (int c = 0; c < COLS; c++) 
    {
        cout << " C" << c << " ";
        if (c < COLS - 1) cout << " ";
    }
    cout << "\n";

    imprimirLineaHorizontal();

    for (int f = 0; f < FILAS; f++) 
    {
        // Etiqueta de fila (F0 arriba = Norte, F9 abajo = posición inicial)
        cout << "F" << f << " |";

        for (int c = 0; c < COLS; c++) 
        {
            // Determinar qué mostrar en esta celda
            char simbolo;
            bool esAgente = (f == agente.fila && c == agente.col);

            if (esAgente) 
            {
                simbolo = SIM_AGENTE;
            } else 
            {
                simbolo = tableroReal[f][c];
            }

            // Mostrar percepciones en celdas visitadas que no tienen entidad peligrosa
            // (la celda se muestra con su contenido real; las percepciones van en la tabla)
            cout << " " << simbolo << " |";
        }

        // Indicador de fila especial
        if (f == FILAS - 1) cout << "  <- Inicio";
        cout << "\n";

        imprimirLineaHorizontal();
    }

    // Percepciones actuales del agente
    int posActual = idx(agente.fila, agente.col);
    cout << "\n  [Pos actual: F" << agente.fila << " C" << agente.col << "]";
    cout << "  Percepciones: ";
    bool alguPercepcion = false;
    if (hayBrisa[posActual])  { cout << "BRISA ";  alguPercepcion = true; }
    if (hayHedor[posActual])  { cout << "HEDOR ";  alguPercepcion = true; }
    if (hayBrillo[posActual]) { cout << "BRILLO "; alguPercepcion = true; }
    if (!alguPercepcion)      { cout << "Ninguna"; }
    if (agente.tieneOro)      { cout << "  [Llevas el ORO]"; }
    cout << "\n";
}

// Imprime la tabla completa de percepciones de TODOS los estados.
// Se muestra cada turno
void imprimirTablaPercepciones() 
{
    cout << "\n  === TABLA DE PERCEPCIONES (todos los estados) ===\n";
    cout << "  +------+--------+-------+--------+----------+\n";
    cout << "  | Celda| Fila   | Col   | Brisa  | Hedor  | Brillo |\n";
    cout << "  +------+--------+-------+--------+--------+--------+\n";

    for (int f = 0; f < FILAS; f++) 
    {
        for (int c = 0; c < COLS; c++) 
        {
            int i = idx(f, c);
            // Solo mostrar celdas que tienen al menos una percepción
            // o que fueron visitadas (para no imprimir 100 filas vacías)
            if (hayBrisa[i] || hayHedor[i] || hayBrillo[i] || visitado[i]) 
            {
                cout << "  | F" << f << "C" << c
                     << " |  " << f << "      |  " << c << "    "
                     << "|  " << (hayBrisa[i]  ? "SI " : "NO ")
                     << "  |  " << (hayHedor[i]  ? "SI " : "NO ")
                     << "  |  " << (hayBrillo[i] ? "SI " : "NO ")
                     << "  |\n";
            }
        }
    }

    cout << "  +------+--------+-------+--------+--------+--------+\n";
    cout << "  [*] Solo se muestran celdas con percepcion o visitadas\n";
}

// Imprime la tabla/lista de acciones realizadas en la partida.
void imprimirTablaAcciones() 
{
    cout << "\n  === TABLA DE ACCIONES  |  Total: " << numAcciones << " ===\n";
    cout << "  +-----+--------------------------------------------------+\n";
    cout << "  | Num | Accion                                           |\n";
    cout << "  +-----+--------------------------------------------------+\n";

    // Mostrar las últimas 15 acciones para no llenar la pantalla
    int inicio = (numAcciones > 15) ? numAcciones - 15 : 0;
    for (int i = inicio; i < numAcciones; i++) 
    {
        cout << "  | " ;
        if (i + 1 < 10)  cout << " ";
        if (i + 1 < 100) cout << " ";
        cout << (i + 1) << " | " << logAcciones[i];

        // Padding para alinear la columna derecha
        int len = strlen(logAcciones[i]);
        for (int s = len; s < 48; s++) cout << " ";
        cout << "|\n";
    }

    if (numAcciones > 15) 
    {
        cout << "  |  ... (se muestran las ultimas 15 de " << numAcciones << " acciones totales)  |\n";
    }

    cout << "  +-----+--------------------------------------------------+\n";
    cout << "  Conteo total de acciones: " << numAcciones << "\n";
}

// =============================================================
//  MECÁNICAS DEL JUEGO
// =============================================================

// Intenta mover al agente en la dirección indicada.
// Retorna true si el movimiento fue válido.
bool moverAgente(char direccion) 
{
    int nuevaFila = agente.fila;
    int nuevaCol  = agente.col;

    char dirMayus = (direccion >= 'a' && direccion <= 'z')
                    ? (direccion - 32) : direccion;

    if      (dirMayus == 'W') nuevaFila--;  // Arriba  (Norte)
    else if (dirMayus == 'S') nuevaFila++;  // Abajo   (Sur)
    else if (dirMayus == 'A') nuevaCol--;   // Izquierda (Oeste)
    else if (dirMayus == 'D') nuevaCol++;   // Derecha   (Este)
    else return false;  // tecla no reconocida

    if (!dentroDelTablero(nuevaFila, nuevaCol)) 
    {
        registrarAccion("Movimiento invalido: fuera del tablero");
        return false;
    }

    agente.fila = nuevaFila;
    agente.col  = nuevaCol;
    agente.turno++;
    visitado[idx(agente.fila, agente.col)] = true;

    // Construir mensaje de acción
    char msg[MAX_LOG];
    const char* dirNombre = "?";
    if      (dirMayus == 'W') dirNombre = "Norte";
    else if (dirMayus == 'S') dirNombre = "Sur";
    else if (dirMayus == 'A') dirNombre = "Oeste";
    else if (dirMayus == 'D') dirNombre = "Este";

    sprintf(msg, "Turno %d: Mover %s -> F%d C%d",
            agente.turno, dirNombre, agente.fila, agente.col);
    registrarAccion(msg);

    return true;
}

// Intenta recoger el oro si el agente está en su celda.
void tomarOro() 
{
    int f = agente.fila;
    int c = agente.col;

    if (tableroReal[f][c] == SIM_ORO && !agente.tieneOro) 
    {
        agente.tieneOro    = true;
        tableroReal[f][c]  = SIM_VACIO;   // quitar el oro del mapa
        hayBrillo[idx(f,c)] = false;
        agente.turno++;

        char msg[MAX_LOG];
        sprintf(msg, "Turno %d: *** ORO TOMADO en F%d C%d ***",
                agente.turno, f, c);
        registrarAccion(msg);
        calcularPercepciones();  // actualizar brillo
        cout << "\n  *** Encontraste el ORO! Ahora ve al inicio (F9 C0) ***\n";
    } else if (agente.tieneOro) 
    {
        registrarAccion("Accion ignorada: ya tienes el oro");
    } else 
    {
        registrarAccion("Accion ignorada: no hay oro aqui");
    }
}

// Verifica el estado actual de la partida.
int verificarEstado() 
{
    int f = agente.fila;
    int c = agente.col;
    char celda = tableroReal[f][c];

    if (celda == SIM_POZO) 
    {
        return ESTADO_MURIO_POZO;
    }
    if (celda == SIM_WUMPUS) 
    {
        return ESTADO_MURIO_WUMPUS;
    }
    // Victoria: tiene el oro y regresó a la casilla inicial
    if (agente.tieneOro && f == FILAS - 1 && c == 0) 
    {
        return ESTADO_GANO;
    }
    return ESTADO_CONTINUA;
}

// =============================================================
//  PANTALLA COMPLETA POR TURNO
// =============================================================

void imprimirEstadoCompleto() 
{
    limpiarConsola();
    imprimirTablero();
    imprimirTablaPercepciones();
    imprimirTablaAcciones();
}

// =============================================================
//  FINALIZAR PARTIDA
// =============================================================

void finalizarPartida(int resultado) 
{
    limpiarConsola();
    imprimirTablero();
    imprimirTablaAcciones();

    cout << "\n  ============================================\n";
    if (resultado == ESTADO_GANO) 
    {
        cout << "  *** FELICITACIONES! GANASTE! ***\n";
        cout << "  Encontraste el oro y regresaste sano al inicio.\n";
    } else if (resultado == ESTADO_MURIO_POZO) 
    {
        cout << "  *** CAISTE EN UN POZO! PERDISTE ***\n";
        cout << "  El agente cayo en un pozo sin fondo...\n";
    } else if (resultado == ESTADO_MURIO_WUMPUS) 
    {
        cout << "  *** EL WUMPUS TE DEVORO! PERDISTE ***\n";
        cout << "  El Wumpus acecha en las sombras del laberinto.\n";
    }
    cout << "\n  Turnos jugados : " << agente.turno    << "\n";
    cout << "  Acciones totales: " << numAcciones << "\n";
    cout << "  ============================================\n\n";
}

// =============================================================
//  MENÚ PRINCIPAL
// =============================================================

void mostrarMenuPrincipal() 
{
    cout << "\n";
    cout << "  ╔══════════════════════════════════════╗\n";
    cout << "  ║       MUNDO DE WUMPUS  v1.0          ║\n";
    cout << "  ╠══════════════════════════════════════╣\n";
    cout << "  ║  1. Nueva partida                    ║\n";
    cout << "  ║  2. Ver reglas                       ║\n";
    cout << "  ║  0. Salir                            ║\n";
    cout << "  ╚══════════════════════════════════════╝\n";
    cout << "  Opcion: ";
}

void mostrarReglas() 
{
    limpiarConsola();
    cout << "\n  === REGLAS DEL JUEGO ===\n\n";
    cout << "  OBJETIVO:\n";
    cout << "    Encuentra el oro (O) y regresa al inicio (F9 C0) sin morir.\n\n";
    cout << "  TABLERO:\n";
    cout << "    Grilla de 10x10. El agente (A) inicia en la esquina\n";
    cout << "    inferior izquierda (Fila 9, Columna 0).\n\n";
    cout << "  CONTROLES:\n";
    cout << "    W = Mover al Norte (arriba)\n";
    cout << "    S = Mover al Sur   (abajo)\n";
    cout << "    A = Mover al Oeste (izquierda)\n";
    cout << "    D = Mover al Este  (derecha)\n";
    cout << "    T = Tomar el oro (si estas encima de el)\n";
    cout << "    Q = Rendirse / abandonar partida\n\n";
    cout << "  SIMBOLOS:\n";
    cout << "    A = Agente (tu personaje)\n";
    cout << "    O = Oro\n";
    cout << "    W = Wumpus (te mata si entras)\n";
    cout << "    P = Pozo   (te mata si caes)\n";
    cout << "    . = Celda vacia\n\n";
    cout << "  PERCEPCIONES (en tu celda actual):\n";
    cout << "    BRISA  = hay un pozo adyacente\n";
    cout << "    HEDOR  = el Wumpus esta adyacente\n";
    cout << "    BRILLO = el oro esta aqui (usa T para tomarlo)\n\n";
    cout << "  Presiona Enter para volver al menu...";
    cin.ignore();
    cin.get();
}

// =============================================================
//  BUCLE PRINCIPAL DE JUEGO
// =============================================================

void inicializarJuego() 
{
    srand((unsigned int)time(0));
    inicializarTablero();
    inicializarPercepciones();
    inicializarAgente();
    inicializarLog();
    colocarEntidades();
    calcularPercepciones();
    visitado[idx(agente.fila, agente.col)] = true;
    estadoJuego = ESTADO_CONTINUA;
    registrarAccion("Juego iniciado. Agente en F9 C0.");
}

void bucleJuego() 
{
    // Imprimir estado inicial
    imprimirEstadoCompleto();

    cout << "\n  Controles: W=Norte S=Sur A=Oeste D=Este  T=Tomar oro  Q=Rendirse\n";
    cout << "  > ";

    while (estadoJuego == ESTADO_CONTINUA) 
    {
        char entrada;
        cin >> entrada;

        // Convertir a mayúscula
        if (entrada >= 'a' && entrada <= 'z') entrada -= 32;

        if (entrada == 'Q') 
        {
            char msg[MAX_LOG];
            sprintf(msg, "Turno %d: El jugador se rindio.", agente.turno);
            registrarAccion(msg);
            estadoJuego = ESTADO_MURIO_POZO;  // cuenta como derrota
            break;
        }

        if (entrada == 'T') 
        {
            tomarOro();
        } else if (entrada == 'W' || entrada == 'S' ||
                   entrada == 'A' || entrada == 'D') {
            moverAgente(entrada);
        } else {
            cout << "  Tecla no reconocida. Usa W/A/S/D, T o Q.\n  > ";
            continue;
        }

        // Verificar resultado ANTES de imprimir
        estadoJuego = verificarEstado();

        // Imprimir estado completo actualizado
        imprimirEstadoCompleto();

        if (estadoJuego != ESTADO_CONTINUA) break;

        cout << "\n  Controles: W=Norte S=Sur A=Oeste D=Este  T=Tomar oro  Q=Rendirse\n";
        cout << "  > ";
    }

    finalizarPartida(estadoJuego);
}

// =============================================================
//  MAIN
// =============================================================

int main() 
{
    int opcion = -1;

    do 
    {
        limpiarConsola();
        mostrarMenuPrincipal();
        cin >> opcion;

        if (opcion == 1) 
        {
            inicializarJuego();
            bucleJuego();

            // Preguntar si jugar de nuevo
            cout << "  Presiona Enter para volver al menu...";
            cin.ignore();
            cin.get();

        } else if (opcion == 2) 
        {
            mostrarReglas();
        }

    } while (opcion != 0);

    limpiarConsola();
    cout << "\n  Gracias por jugar al Mundo de Wumpus!\n\n";
    return 0;
}
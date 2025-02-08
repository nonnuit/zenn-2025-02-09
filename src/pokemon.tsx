import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Play, Pause, RefreshCw, Book, X } from 'lucide-react';

// Types and Interfaces
interface Pokemon {
  id: number;
  name: string;
  types: string[];
  image: string;
  captureDate?: string;
}

interface ButtonProps {
  variant?: string;
  disabled?: boolean;
}

// Styled Components
const Container = styled.div`
  margin: 0 auto;
  padding: 16px;
`;

const StyledCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #e5e7eb;
`;

const CardTitle = styled.h2`
  color: #888;
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  margin: 0;
`;

const CardContent = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TimerDisplay = styled.div`
  color: #888;
  font-size: 25px;
  font-weight: bold;
  text-align: center;
`;

const TimerInput = styled.input`
  width: 80px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
`;
const P = styled.p`
  margin-bottom: 0;
  color: #888;
`;

const Button = styled.button<ButtonProps>`
  color: #888;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: ${(props) =>
    props.variant === 'ghost' ? 'transparent' : 'white'};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  &:hover {
    background: ${(props) =>
      props.variant === 'ghost' ? 'rgba(0,0,0,0.05)' : '#f9fafb'};
  }
`;

const PokemonCard = styled.div`
  text-align: center;
  margin-top: 16px;
`;

const PokemonImage = styled.img`
  width: 150px;
  height: 150px;
  margin: 0 auto;
  text-align: center;
`;

const PokemonName = styled.h3`
  color: #888;
  font-size: 20px;
  font-weight: bold;
  text-transform: capitalize;
  margin: 0;
`;

const TypeContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const TypeBadge = styled.span`
  padding: 4px 8px;
  background-color: #dbeafe;
  border-radius: 9999px;
  font-size: 14px;
`;

const PokedexOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const PokedexModal = styled.div`
  color: #888;
  background: white;
  border-radius: 8px;
  max-width: 672px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
`;

const PokedexHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PokedexContent = styled.div`
  padding: 16px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
`;

const PokedexGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
`;

const LoadingText = styled.div`
  color: #888;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  text-align: center;
  margin-top: 16px;
`;

const CaptureDate = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
`;

const PokemonStudyTimer: React.FC = () => {
  const [initialTime, setInitialTime] = useState<number>(0); // 5 minutes in seconds
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [caughtPokemon, setCaughtPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPokedex, setShowPokedex] = useState<boolean>(false);

  useEffect(() => {
    const savedPokemon = localStorage.getItem('caughtPokemon');
    if (savedPokemon) {
      setCaughtPokemon(JSON.parse(savedPokemon));
    }
  }, []);

  useEffect(() => {
    if (caughtPokemon.length > 0) {
      localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
    }
  }, [caughtPokemon]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      getPokemon();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'minutes' | 'seconds'
  ) => {
    const value = parseInt(e.target.value) || 0;
    if (type === 'minutes') {
      setInitialTime(value * 60 + (timeLeft % 60));
      setTimeLeft(value * 60 + (timeLeft % 60));
    } else {
      setInitialTime(Math.floor(timeLeft / 60) * 60 + value);
      setTimeLeft(Math.floor(timeLeft / 60) * 60 + value);
    }
  };

  const resetTimer = (): void => {
    setTimeLeft(initialTime);
    setIsRunning(false);
    setPokemon(null);
    setError(null);
  };

  const getPokemon = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const id = Math.floor(Math.random() * 151) + 1;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();
      const newPokemon: Pokemon = {
        id: data.id,
        name: data.name,
        types: data.types.map((t: { type: { name: string } }) => t.type.name),
        image: data.sprites.front_default,
        captureDate: new Date().toLocaleDateString(),
      };
      setPokemon(newPokemon);
      setCaughtPokemon((prev) => [...prev, newPokemon]);
    } catch (err) {
      setError('ポケモンの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const sortedPokemon = [...caughtPokemon].sort((a, b) => a.id - b.id);

  const Pokedex: React.FC = () => (
    <PokedexOverlay>
      <PokedexModal>
        <PokedexHeader>
          <TimerDisplay>ポケモン図鑑</TimerDisplay>
          <Button variant='ghost' onClick={() => setShowPokedex(false)}>
            <X size={16} />
          </Button>
        </PokedexHeader>
        <PokedexContent>
          {caughtPokemon.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              まだポケモンを捕まえていません
            </p>
          ) : (
            <PokedexGrid>
              {sortedPokemon.map((pokemon, index) => (
                <StyledCard key={`${pokemon.id}-${index}`}>
                  <CardContent>
                    <PokemonImage src={pokemon.image} alt={pokemon.name} />
                    <div>
                      <PokemonName>
                        No.{String(pokemon.id).padStart(3, '0')} {pokemon.name}
                      </PokemonName>
                      <TypeContainer>
                        {pokemon.types.map((type, idx) => (
                          <TypeBadge key={idx}>{type}</TypeBadge>
                        ))}
                      </TypeContainer>
                      <CaptureDate>
                        捕まえた日: {pokemon.captureDate}
                      </CaptureDate>
                    </div>
                  </CardContent>
                </StyledCard>
              ))}
            </PokedexGrid>
          )}
        </PokedexContent>
      </PokedexModal>
    </PokedexOverlay>
  );

  return (
    <Container>
      <StyledCard>
        <CardHeader>
          <CardTitle>- timer -</CardTitle>
          <TimerDisplay>{formatTime(timeLeft)}</TimerDisplay>
        </CardHeader>
        <CardContent>
          <div>
            <ButtonContainer>
              <TimerInput
                type='number'
                min='1'
                placeholder='0'
                onChange={(e) => handleTimeInput(e, 'minutes')}
                disabled={isRunning}
              />
              <P>分</P>
              <TimerInput
                type='number'
                min='0'
                max='59'
                placeholder='00'
                onChange={(e) => handleTimeInput(e, 'seconds')}
                disabled={isRunning}
              />
              <P>秒</P>
            </ButtonContainer>
            <ButtonContainer>
              <Button
                onClick={() => setIsRunning(!isRunning)}
                disabled={timeLeft === 0}
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isRunning ? '一時停止' : 'スタート'}
              </Button>
              <Button onClick={resetTimer}>
                <RefreshCw size={16} />
                リセット
              </Button>
              <Button onClick={() => setShowPokedex(true)}>
                <Book size={16} />
                図鑑
              </Button>
            </ButtonContainer>
            {loading && <LoadingText>ポケモンを捕まえています...</LoadingText>}
            {error && (
              <ErrorText>
                {error}
                <Button onClick={getPokemon} style={{ marginTop: '10px' }}>
                  再試行
                </Button>
              </ErrorText>
            )}
            {pokemon && !loading && (
              <PokemonCard>
                <PokemonImage src={pokemon.image} alt={pokemon.name} />
                <PokemonName>
                  No.{String(pokemon.id).padStart(3, '0')} {pokemon.name}
                </PokemonName>
                {/* <TypeContainer>
                  {pokemon.types.map((type, index) => (
                    <TypeBadge key={index}>{type}</TypeBadge>
                  ))}
                </TypeContainer> */}
              </PokemonCard>
            )}
          </div>
        </CardContent>
      </StyledCard>
      {showPokedex && <Pokedex />}
    </Container>
  );
};

export default PokemonStudyTimer;

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, CheckCircle, XCircle } from "lucide-react";

interface QuizState {
  currentIndex: number;
  score: number;
  answered: boolean;
  selectedAnswer: number | null;
  showResult: boolean;
  totalQuestions: number;
}

export default function Quiz() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({
    currentIndex: 0,
    score: 0,
    answered: false,
    selectedAnswer: null,
    showResult: false,
    totalQuestions: 0,
  });
  const [formData, setFormData] = useState({
    question: "",
    options: "",
    correctAnswer: "",
    explanation: "",
  });

  // Fetch quiz questions
  const { data: questions, isLoading, refetch } = trpc.quizQuestions.list.useQuery({ status: "approved" });

  // Create quiz question mutation
  const createQuestion = trpc.quizQuestions.create.useMutation({
    onSuccess: () => {
      toast.success("Questão enviada para moderação!");
      setFormData({ question: "", options: "", correctAnswer: "", explanation: "" });
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar questão");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.options || !formData.correctAnswer) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      const optionsArray = JSON.parse(formData.options);
      const correctIndex = parseInt(formData.correctAnswer);
      if (!Array.isArray(optionsArray) || correctIndex < 0 || correctIndex >= optionsArray.length) {
        toast.error("Formato de opções ou índice de resposta inválido");
        return;
      }
      createQuestion.mutate({
        question: formData.question,
        options: formData.options,
        correctAnswer: correctIndex,
        explanation: formData.explanation || undefined,
      });
    } catch {
      toast.error("Opções devem ser um array JSON válido");
    }
  };

  const startQuiz = () => {
    if (!questions || questions.length === 0) {
      toast.error("Nenhuma questão disponível");
      return;
    }
    setIsQuizActive(true);
    setQuizState({
      currentIndex: 0,
      score: 0,
      answered: false,
      selectedAnswer: null,
      showResult: false,
      totalQuestions: questions.length,
    });
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (!quizState.answered) {
      setQuizState({ ...quizState, selectedAnswer: optionIndex });
    }
  };

  const handleSubmitAnswer = () => {
    if (quizState.selectedAnswer === null) {
      toast.error("Selecione uma opção");
      return;
    }

    if (!questions) return;
    const currentQuestion = questions[quizState.currentIndex];
    const isCorrect = quizState.selectedAnswer === currentQuestion.correctAnswer;
    const newScore = isCorrect ? quizState.score + 1 : quizState.score;

    setQuizState({
      ...quizState,
      answered: true,
      showResult: true,
      score: newScore,
    });
  };

  const handleNextQuestion = () => {
    if (!questions) return;
    
    if (quizState.currentIndex < questions.length - 1) {
      setQuizState({
        currentIndex: quizState.currentIndex + 1,
        score: quizState.score,
        answered: false,
        selectedAnswer: null,
        showResult: false,
        totalQuestions: quizState.totalQuestions,
      });
    } else {
      setIsQuizActive(false);
      toast.success(`Quiz finalizado! Pontuação: ${quizState.score}/${questions.length}`);
    }
  };

  const parseOptions = (optionsStr: string) => {
    try {
      return JSON.parse(optionsStr);
    } catch {
      return [];
    }
  };

  if (!questions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Quiz</h1>
            <p className="text-slate-600 mt-2">Teste seus conhecimentos com questões educativas</p>
          </div>
          {user && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} />
                  Nova Questão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Enviar Nova Questão de Quiz</DialogTitle>
                  <DialogDescription>
                    Crie uma questão de múltipla escolha. Será revisada antes de ser publicada.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Questão *</label>
                    <Textarea
                      placeholder="Digite a questão"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Opções (JSON array) *</label>
                    <Textarea
                      placeholder={`["Opção A", "Opção B", "Opção C", "Opção D"]`}
                      value={formData.options}
                      onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Índice da Resposta Correta * (0-3)</label>
                    <Input
                      type="number"
                      min="0"
                      max="3"
                      placeholder="0"
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Explicação</label>
                    <Textarea
                      placeholder="Explique por que essa é a resposta correta"
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button disabled={createQuestion.isPending}>
                      {createQuestion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enviar para Moderação
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Quiz Interface */}
        {isQuizActive && questions.length > 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Questão {quizState.currentIndex + 1} de {quizState.totalQuestions}</CardTitle>
                <Badge variant="outline">Pontuação: {quizState.score}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{questions[quizState.currentIndex].question}</h3>
                <RadioGroup value={String(quizState.selectedAnswer)} onValueChange={(v) => handleAnswerSelect(parseInt(v))}>
                  <div className="space-y-3">
                    {parseOptions(questions[quizState.currentIndex].options).map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={String(index)} id={`option-${index}`} disabled={quizState.answered} />
                        <Label
                          htmlFor={`option-${index}`}
                          className={`flex-1 cursor-pointer p-3 rounded-lg border-2 transition-colors ${
                            quizState.answered
                              ? index === questions[quizState.currentIndex].correctAnswer
                                ? "border-green-500 bg-green-50"
                                : index === quizState.selectedAnswer
                                ? "border-red-500 bg-red-50"
                                : "border-slate-200"
                              : quizState.selectedAnswer === index
                              ? "border-red-500 bg-red-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {quizState.showResult && (
                <div className={`p-4 rounded-lg ${quizState.selectedAnswer === questions[quizState.currentIndex].correctAnswer ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {quizState.selectedAnswer === questions[quizState.currentIndex].correctAnswer ? (
                      <>
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="font-semibold text-green-600">Resposta Correta!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-600" size={20} />
                        <span className="font-semibold text-red-600">Resposta Incorreta</span>
                      </>
                    )}
                  </div>
                  {questions[quizState.currentIndex].explanation && (
                    <p className="text-sm text-slate-700 mt-2">
                      <strong>Explicação:</strong> {questions[quizState.currentIndex].explanation}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                {!quizState.answered ? (
                  <Button onClick={handleSubmitAnswer} size="lg">
                    Confirmar Resposta
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} size="lg">
                    {quizState.currentIndex < quizState.totalQuestions - 1 ? "Próxima Questão" : "Finalizar Quiz"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Questions List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : questions && questions.length > 0 ? (
              <div className="space-y-6">
                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-900">Bem-vindo ao Quiz!</CardTitle>
                    <CardDescription className="text-red-800">
                      Existem {questions.length} questões disponíveis. Teste seus conhecimentos e veja sua pontuação!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={startQuiz} size="lg" className="gap-2">
                      Iniciar Quiz
                    </Button>
                  </CardContent>
                </Card>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Questões Disponíveis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {questions.map((question, index) => (
                      <Card key={question.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="line-clamp-2">Questão {index + 1}</CardTitle>
                            <Badge variant="secondary">{question.status}</Badge>
                          </div>
                          <CardDescription className="line-clamp-3">{question.question}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-xs text-slate-600">
                              <strong>Opções:</strong> {parseOptions(question.options).length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-slate-600">Nenhuma questão publicada ainda</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactPlayer from 'react-player';
import { PlayCircle, CheckCircle, Lock, Award, X, LogOut } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { fetchApi } from '../../lib/api';

export default function StudentDashboard() {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizError, setQuizError] = useState(false);
  const [courseFinished, setCourseFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (!u.id) {
          router.push('/login');
          return;
        }
        setUser(u);
        const data = await fetchApi('/courses');
        if (data && data.length > 0) {
          setCourse(data[0]); // Take the first course for now
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Cargando...</div>;
  }

  if (!course) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">No hay cursos asignados.</div>;
  }

  // Flatten lessons from modules for the UI
  const allLessons = course.modules.flatMap((m: any) => m.lessons.map((l: any) => ({ ...l, moduleQuiz: m.quiz })));
  const currentLesson = allLessons[currentLessonIndex];

  const handleOpenQuiz = () => {
    setShowQuiz(true);
    setSelectedAnswer(null);
    setQuizError(false);
  };

  const handleSubmitQuiz = async () => {
    const isCorrect = currentLesson.moduleQuiz.questions[0].answers.find((a: any) => a.id === selectedAnswer)?.isCorrect;
    
    if (isCorrect) {
      // Pass
      setShowQuiz(false);
      const newCompleted = [...completedLessons, currentLesson.id];
      setCompletedLessons(newCompleted);
      
      // Update progress in backend (fire and forget)
      fetchApi('/progress', {
        method: 'POST',
        body: JSON.stringify({ lessonId: currentLesson.id, isCompleted: true })
      }).catch(console.error);
      
      if (currentLessonIndex < allLessons.length - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1);
      } else {
        setCourseFinished(true);
      }
    } else {
      // Fail
      setQuizError(true);
    }
  };

  const downloadCertificate = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Background
    doc.setFillColor(0, 0, 0); // Black background
    doc.rect(0, 0, 297, 210, 'F');
    
    // Border
    doc.setDrawColor(212, 188, 111); // #D4BC6F
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    // Title
    doc.setTextColor(212, 188, 111);
    doc.setFontSize(40);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICADO DE APROVECHAMIENTO", 148.5, 50, { align: 'center' });
    
    // Body
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("Se otorga el presente diploma a:", 148.5, 80, { align: 'center' });
    
    // Name
    doc.setFontSize(30);
    doc.setTextColor(212, 188, 111);
    doc.text("Estudiante / Empleado", 148.5, 100, { align: 'center' });
    
    // Text
    doc.setFontSize(14);
    doc.setTextColor(200, 200, 200);
    doc.text("Por haber superado con éxito la capacitación obligatoria para", 148.5, 130, { align: 'center' });
    doc.text("el equipo del Restaurante, demostrando excelencia en el servicio.", 148.5, 140, { align: 'center' });

    // Footer
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    const dateStr = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha de expedición: ${dateStr}`, 148.5, 180, { align: 'center' });

    doc.save("certificado-barograma.pdf");
  };

  if (courseFinished) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center p-6 text-center">
        <Award className="w-24 h-24 text-yellow-500 mb-6" style={{ color: '#D4BC6F' }} />
        <h1 className="text-3xl font-bold mb-4">¡Curso Completado!</h1>
        <p className="text-gray-400 mb-8">Has superado todas las lecciones y evaluaciones. Tu certificado ya está disponible.</p>
        <button onClick={downloadCertificate} className="px-8 py-4 font-bold text-black rounded-full text-lg shadow-lg hover:opacity-90 transition-transform active:scale-95" style={{ backgroundColor: '#D4BC6F' }}>
          Descargar Certificado PDF
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-20 relative">
      {/* Header */}
      <header className="p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-black z-10">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Barograma" className="h-8 object-contain" />
          <h1 className="text-xl font-bold" style={{ color: '#D4BC6F' }}>Academy</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-500">
            <span className="text-xs font-semibold">ME</span>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white" title="Cerrar Sesión">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Video Player Section */}
        <section className="relative w-full aspect-[9/16] bg-gray-900 mx-auto md:max-w-md md:aspect-video md:max-h-[50vh]">
          <ReactPlayer 
            url={currentLesson.videoUrl}
            width="100%"
            height="100%"
            controls
            playing={false}
            config={{ file: { forceHLS: true } }}
          />
        </section>

        {/* Lesson Info */}
        <section className="p-4 mt-4 md:max-w-2xl md:mx-auto">
          <h2 className="text-2xl font-bold mb-6">{currentLesson.title}</h2>

          {!completedLessons.includes(currentLesson.id) ? (
            <button 
              onClick={handleOpenQuiz}
              className="w-full py-4 rounded-full font-bold text-black transition-transform active:scale-95 shadow-lg" 
              style={{ backgroundColor: '#D4BC6F' }}
            >
              Responder Quiz para Avanzar
            </button>
          ) : (
            <div className="w-full py-4 rounded-full font-bold text-green-500 bg-green-500/10 flex items-center justify-center space-x-2 border border-green-500/20">
              <CheckCircle className="w-5 h-5" />
              <span>Lección superada</span>
            </div>
          )}
        </section>

        {/* Modules List */}
        <section className="p-4 mt-2 border-t border-gray-800 md:max-w-2xl md:mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Catálogo del Curso</h3>
          <ul className="space-y-4">
            {allLessons.map((lesson: any, idx: number) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isActive = idx === currentLessonIndex;
              const isLocked = idx > 0 && !completedLessons.includes(allLessons[idx-1].id);

              return (
                <li 
                  key={lesson.id}
                  onClick={() => !isLocked && setCurrentLessonIndex(idx)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isActive ? 'bg-gray-800 border-[#D4BC6F]' : 'bg-gray-900 border-gray-800'} ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-800'}`}
                >
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <CheckCircle className="text-green-500 w-5 h-5" />
                    ) : isActive ? (
                      <PlayCircle className="w-5 h-5" style={{ color: '#D4BC6F' }} />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5 text-gray-500" />
                    ) : (
                      <PlayCircle className="w-5 h-5 text-gray-500" />
                    )}
                    <span className={isActive ? 'font-semibold' : ''} style={{ color: isActive ? '#D4BC6F' : '#fff' }}>
                      {lesson.title}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-end md:justify-center animate-in fade-in duration-200">
          <div className="bg-gray-900 w-full md:w-full md:max-w-md p-6 rounded-t-3xl md:rounded-3xl border-t border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#D4BC6F' }}>Evaluación</h3>
              <button onClick={() => setShowQuiz(false)} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-lg font-medium mb-6 leading-relaxed">{currentLesson.moduleQuiz?.questions[0].text}</p>
            
            <div className="space-y-3 mb-8">
              {currentLesson.moduleQuiz?.questions[0].answers.map((opt: any) => (
                <button
                  key={opt.id}
                  onClick={() => { setSelectedAnswer(opt.id); setQuizError(false); }}
                  className={`w-full p-4 rounded-xl text-left border transition-all ${selectedAnswer === opt.id ? 'border-[#D4BC6F] bg-[#D4BC6F]/10 scale-[1.02]' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {quizError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl text-sm text-center font-medium">
                Respuesta incorrecta. Por favor, repasa el vídeo y vuelve a intentarlo.
              </div>
            )}

            <button 
              onClick={handleSubmitQuiz}
              disabled={selectedAnswer === null}
              className="w-full py-4 rounded-full font-bold text-black disabled:opacity-50 disabled:bg-gray-500 transition-colors"
              style={{ backgroundColor: selectedAnswer !== null ? '#D4BC6F' : undefined }}
            >
              Enviar Respuesta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

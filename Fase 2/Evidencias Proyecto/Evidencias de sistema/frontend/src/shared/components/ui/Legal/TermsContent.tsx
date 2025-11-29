// components/Legal/TermsContent.tsx

export default function TermsContent() {
  return (
    <div className="text-sm text-gray-700 space-y-4 leading-relaxed max-h-[400px] overflow-y-auto pr-1">
      <p>
        <strong>Última actualización:</strong> Mayo 2025
      </p>

      <p>
        El acceso y uso de la plataforma <strong>Evalink</strong> está
        condicionado a la aceptación de estos Términos y Condiciones. Al
        ingresar, el usuario declara haberlos leído y aceptado.
      </p>

      <p>
        Esta plataforma está destinada exclusivamente a{" "}
        <strong>docentes y trabajadores del establecimiento</strong> habilitados
        por la dirección. Se prohíbe el acceso de terceros no autorizados.
      </p>

      <p>
        El sistema permite la gestión académica y administrativa, y su uso debe
        limitarse a fines laborales. Toda información personal tratada en el
        sistema está sujeta a confidencialidad conforme a la Ley Nº 19.628.
      </p>

      <p>
        Los usuarios deben mantener en reserva sus credenciales, abstenerse de
        compartir datos sensibles y reportar accesos sospechosos.
      </p>

      <p>
        Queda prohibido modificar, vulnerar o distribuir contenido del sistema
        sin autorización. Toda propiedad intelectual pertenece al equipo
        desarrollador o sus licenciatarios.
      </p>

      <p className="text-xs text-gray-400 text-center pt-2">© 2025 Evalink</p>
    </div>
  );
}

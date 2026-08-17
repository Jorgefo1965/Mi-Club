function populateJinetesDropdownInClassModal() {
            dom.modalStudentSelect.innerHTML = '<option value="">-- Seleccionar Jinete / Alumno --</option>';
            
            if (currentRole === 'client' && currentPersonaUser) {
                dom.modalStudentSelect.disabled = false;
                
                // Recopilar a quiénes puede representar (él mismo y los alumnos que lo tienen como apoderado)
                let allowedJinetes = [{ nombre: currentPersonaUser.nombre, id: currentPersonaUser.id }];
                
                if (currentPersonaUser.es_apoderado || currentPersonaUser.es_propietario) {
                    const pupilos = personas.filter(p => p.apoderado_id == currentPersonaUser.id);
                    pupilos.forEach(p => {
                        if (!allowedJinetes.some(j => j.id === p.id)) {
                            allowedJinetes.push({ nombre: p.nombre, id: p.id });
                        }
                    });
                }

                allowedJinetes.forEach(j => {
                    const opt = document.createElement('option');
                    opt.value = j.nombre;
                    opt.textContent = j.nombre + (j.id === currentPersonaUser.id ? ' (Tú)' : ' (Pupilo)');
                    dom.modalStudentSelect.appendChild(opt);
                });

                // Si hay alumnos/pupilos, actualizar los caballos sugeridos al cambiar de selección
                dom.modalStudentSelect.onchange = () => updateHorseOptionsForSelectedStudent();
            } else {
                dom.modalStudentSelect.disabled = false;
                personas.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.nombre;
                    opt.textContent = `${p.nombre} ${p.es_alumno ? '(Alumno)' : (p.es_propietario ? '(Dueño)' : '')}`;
                    dom.modalStudentSelect.appendChild(opt);
                });
                dom.modalStudentSelect.onchange = () => updateHorseOptionsForSelectedStudent();
            }
            
            updateHorseOptionsForSelectedStudent();
        }

        function updateHorseOptionsForSelectedStudent() {
            const selectedStudentName = dom.modalStudentSelect.value;
            const studentObj = personas.find(p => p.nombre === selectedStudentName);
            
            dom.modalHorseSelect.innerHTML = '';
            let availableHorses = horses.filter(h => h.active);
            
            if (currentRole === 'client' && currentPersonaUser) {
                if (studentObj) {
                    // Buscar si este alumno/pupilo tiene caballos particulares propios asignados
                    const studentParticularHorses = availableHorses.filter(h => h.ownerPersonaId == studentObj.id);
                    const schoolHorses = availableHorses.filter(h => h.type === 'escuela');
                    
                    // Combinar caballos particulares del alumno + caballos de escuela
                    const combined = [...studentParticularHorses, ...schoolHorses];
                    // Eliminar duplicados si los hubiera
                    availableHorses = Array.from(new Set(combined.map(h => h.id))).map(id => combined.find(h => h.id === id));
                } else if (currentPersonaUser.es_propietario) {
                    availableHorses = availableHorses.filter(h => h.ownerPersonaId == currentPersonaUser.id);
                } else if (currentPersonaUser.es_alumno) {
                    availableHorses = availableHorses.filter(h => h.type === 'escuela');
                }
            } else if (studentObj) {
                // Si es admin/profe y selecciona un alumno que tiene caballo propio, destacarlo o incluirlo
                const studentParticularHorses = availableHorses.filter(h => h.ownerPersonaId == studentObj.id);
                const schoolOrOthers = availableHorses.filter(h => h.type === 'escuela' || h.ownerPersonaId != studentObj.id);
                availableHorses = [...studentParticularHorses, ...schoolOrOthers];
            }

            availableHorses.forEach(h => {
                const opt = document.createElement('option');
                opt.value = h.name;
                opt.textContent = `${h.name} (${h.type === 'escuela' ? 'Escuela' : 'Particular - Dueño: ' + (h.owner || 'Alumno'})`;
                dom.modalHorseSelect.appendChild(opt);
            });
        }

        function openClassModal() {
            populateJinetesDropdownInClassModal();
            dom.modalClassDate.value = getTodayStr();
            dom.classModal.classList.remove('hidden');
        }
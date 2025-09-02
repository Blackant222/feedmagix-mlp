import { petService } from '../services/database/index.js';
import { authMiddleware, getAuthUser } from '../middleware/auth.js';
import { AppError, ValidationError, NotFoundError, asyncHandler, validateRequired, validateUUID } from '../middleware/error.js';
export async function petRoutes(fastify) {
    // Get all pets for authenticated user
    fastify.get('/', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { page = 1, limit = 10, species, search, sort = 'created_at', order = 'desc' } = request.query;
        try {
            const options = {
                page: Number(page),
                limit: Math.min(Number(limit), 50), // Max 50 items per page
                sort,
                order: order,
                species
            };
            const { data: pets, count } = await petService.getUserPets(user.id, options);
            // Filter by search if provided
            let filteredPets = pets;
            if (search) {
                const searchTerm = search.toLowerCase();
                filteredPets = pets.filter(pet => pet.name.toLowerCase().includes(searchTerm) ||
                    pet.species.toLowerCase().includes(searchTerm) ||
                    pet.breed?.toLowerCase().includes(searchTerm));
            }
            const response = {
                success: true,
                data: filteredPets,
                pagination: {
                    page: options.page,
                    limit: options.limit,
                    total: count,
                    pages: Math.ceil(count / options.limit)
                },
                timestamp: new Date().toISOString()
            };
            reply.send(response);
        }
        catch (error) {
            throw new AppError('Failed to fetch pets', 500, 'PETS_FETCH_ERROR');
        }
    }));
    // Get single pet by ID
    fastify.get('/:id', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { id } = request.params;
        if (!validateUUID(id)) {
            throw new ValidationError('Invalid pet ID format');
        }
        try {
            const pet = await petService.getPet(id, user.id);
            const response = {
                success: true,
                data: pet,
                timestamp: new Date().toISOString()
            };
            reply.send(response);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw new NotFoundError('Pet');
            }
            throw new AppError('Failed to fetch pet', 500, 'PET_FETCH_ERROR');
        }
    }));
    // Create new pet
    fastify.post('/', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const petData = request.body;
        // Validate required fields
        validateRequired(petData, ['name', 'species']);
        // Validate species
        const validSpecies = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish'];
        if (!validSpecies.includes(petData.species.toLowerCase())) {
            throw new ValidationError('Invalid species. Supported: ' + validSpecies.join(', '));
        }
        // Validate age if provided
        if (petData.age !== undefined && (petData.age < 0 || petData.age > 30)) {
            throw new ValidationError('Age must be between 0 and 30 years');
        }
        // Validate weight if provided  
        if (petData.weight !== undefined && (petData.weight <= 0 || petData.weight > 200)) {
            throw new ValidationError('Weight must be between 0 and 200 kg');
        }
        try {
            const pet = await petService.createPet(user.id, {
                ...petData,
                species: petData.species.toLowerCase(),
                gender: petData.gender?.toLowerCase()
            });
            const response = {
                success: true,
                data: pet,
                timestamp: new Date().toISOString()
            };
            reply.status(201).send(response);
        }
        catch (error) {
            throw new AppError('Failed to create pet', 500, 'PET_CREATE_ERROR');
        }
    }));
    // Update pet
    fastify.put('/:id', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { id } = request.params;
        const updateData = request.body;
        if (!validateUUID(id)) {
            throw new ValidationError('Invalid pet ID format');
        }
        // Validate species if provided
        if (updateData.species) {
            const validSpecies = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish'];
            if (!validSpecies.includes(updateData.species.toLowerCase())) {
                throw new ValidationError('Invalid species. Supported: ' + validSpecies.join(', '));
            }
            updateData.species = updateData.species.toLowerCase();
        }
        // Validate age if provided
        if (updateData.age !== undefined && (updateData.age < 0 || updateData.age > 30)) {
            throw new ValidationError('Age must be between 0 and 30 years');
        }
        // Validate weight if provided
        if (updateData.weight !== undefined && (updateData.weight <= 0 || updateData.weight > 200)) {
            throw new ValidationError('Weight must be between 0 and 200 kg');
        }
        try {
            const pet = await petService.updatePet(id, user.id, {
                ...updateData,
                gender: updateData.gender?.toLowerCase()
            });
            const response = {
                success: true,
                data: pet,
                timestamp: new Date().toISOString()
            };
            reply.send(response);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw new NotFoundError('Pet');
            }
            throw new AppError('Failed to update pet', 500, 'PET_UPDATE_ERROR');
        }
    }));
    // Delete pet
    fastify.delete('/:id', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { id } = request.params;
        if (!validateUUID(id)) {
            throw new ValidationError('Invalid pet ID format');
        }
        try {
            await petService.deletePet(id, user.id);
            reply.send({
                success: true,
                data: { message: 'Pet deleted successfully' },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw new NotFoundError('Pet');
            }
            throw new AppError('Failed to delete pet', 500, 'PET_DELETE_ERROR');
        }
    }));
    // Get pet with scan history
    fastify.get('/:id/scans', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { id } = request.params;
        const { limit = 5 } = request.query;
        if (!validateUUID(id)) {
            throw new ValidationError('Invalid pet ID format');
        }
        try {
            const petWithScans = await petService.getPetWithScans(id, user.id, Number(limit));
            reply.send({
                success: true,
                data: petWithScans,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw new NotFoundError('Pet');
            }
            throw new AppError('Failed to fetch pet with scans', 500, 'PET_SCANS_FETCH_ERROR');
        }
    }));
    // Get pet health summary
    fastify.get('/:id/health', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { id } = request.params;
        if (!validateUUID(id)) {
            throw new ValidationError('Invalid pet ID format');
        }
        try {
            const healthSummary = await petService.getPetHealthSummary(id, user.id);
            reply.send({
                success: true,
                data: healthSummary,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                throw new NotFoundError('Pet');
            }
            throw new AppError('Failed to fetch pet health summary', 500, 'PET_HEALTH_FETCH_ERROR');
        }
    }));
    // Search pets by name
    fastify.get('/search', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { q } = request.query;
        if (!q || q.trim().length < 2) {
            throw new ValidationError('Search query must be at least 2 characters long');
        }
        try {
            const pets = await petService.searchPetsByName(user.id, q.trim());
            reply.send({
                success: true,
                data: pets,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError('Failed to search pets', 500, 'PET_SEARCH_ERROR');
        }
    }));
    // Get pets by species
    fastify.get('/by-species', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        const { species } = request.query;
        if (!species) {
            throw new ValidationError('Species parameter is required');
        }
        try {
            const pets = await petService.getPetsBySpecies(user.id, species.toLowerCase());
            reply.send({
                success: true,
                data: pets,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError('Failed to fetch pets by species', 500, 'PETS_BY_SPECIES_ERROR');
        }
    }));
    // Get pets needing attention (with health conditions)
    fastify.get('/attention', { preHandler: authMiddleware }, asyncHandler(async (request, reply) => {
        const user = getAuthUser(request);
        try {
            const pets = await petService.getPetsNeedingAttention(user.id);
            reply.send({
                success: true,
                data: pets,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw new AppError('Failed to fetch pets needing attention', 500, 'PETS_ATTENTION_ERROR');
        }
    }));
}
//# sourceMappingURL=pets.js.map
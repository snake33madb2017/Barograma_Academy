import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CoursesService } from './courses.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('courses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @Roles('SUPERADMIN', 'ADMIN')
  create(@Body() createCourseDto: any) {
    return this.coursesService.create(createCourseDto);
  }

  @Put(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  update(@Param('id') id: string, @Body() updateCourseDto: any) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles('SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}

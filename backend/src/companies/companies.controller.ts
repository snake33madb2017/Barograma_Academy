import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompaniesService } from './companies.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('companies')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.companiesService.findOne(id);
  }

  @Post()
  @Roles('SUPERADMIN')
  create(@Body() createCompanyDto: any) {
    return this.companiesService.create(createCompanyDto);
  }

  @Post(':id/employees')
  @Roles('SUPERADMIN', 'ADMIN')
  addEmployee(@Param('id') id: string, @Body() employeeDto: any, @Request() req: any) {
    return this.companiesService.addEmployee(id, employeeDto);
  }


  @Get(':id/kpis')
  @Roles('SUPERADMIN', 'ADMIN')
  getKpis(@Param('id') id: string, @Request() req: any) {
    return this.companiesService.getKpis(id);
  }
}
